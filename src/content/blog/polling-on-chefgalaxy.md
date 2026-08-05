---
title:  "Why I used polling instead of websockets on Chef Galaxy"
date: 2016-06-20T12:00:00
categories:
  - backend
  - chefgalaxy
---

Chef Galaxy has a few parts that need to feel alive. Notifications show up when a chef gets hired or when a dispute moves forward. Customers and chefs message each other while planning an event. For both of these the user should not have to refresh the page to see something new.

I just finished this piece, and I want to write down why I built it the way I did, because the obvious answer was not the one I picked.

#### The obvious answer is websockets

A websocket keeps one connection open between the browser and the server. Once it is open, either side can send a message at any time, and it arrives right away. For chat this is a perfect fit. No refresh, no waiting, nothing wasted.

The problem is not the idea. The problem is my stack.

The web app is **Flask**, and I deploy it with **Apache** and **mod_wsgi** on an **Auto Scaling group** of **EC2** instances behind a load balancer. mod_wsgi gives Apache a pool of workers. A worker takes one request, runs the Flask code, sends the response, and then becomes free for another request. It cannot work on two requests at the same time.

A websocket does something different. It starts as an HTTP request and then changes into a connection that stays open. The browser and server can use that connection to send messages whenever they want. WSGI only describes normal requests and responses. It has no standard way to make this change, so Flask on mod_wsgi cannot handle a websocket by itself.

The number of active requests is therefore limited by the number of workers. The exact limit depends on how Apache is configured. As one example, Apache 2.2 with its prefork setup allows 256 active requests by default. That does not mean it can only serve 256 requests in total. If requests finish quickly, those workers can serve many more requests one after another.

Long connections change the numbers. If 250 users each hold a worker, only six workers remain for pages and API calls. New requests wait until a worker becomes free. I could raise the limit or add more EC2 instances, but each worker still takes memory. I would be using more servers mostly to keep idle connections open.

#### Tornado was the going way to do it

When I looked around, the common answer in Python was **Tornado**. The fair comparison is not Tornado against Flask. Flask is the framework where I write the application. Apache and mod_wsgi are the server setup that runs it. Tornado includes its own HTTP server as well as a framework, and it supports websockets out of the box.

Tornado handles connections with an event loop. Instead of giving every connection its own worker, one process watches many connections. Most websocket connections spend most of their time waiting. While one connection is waiting, the event loop moves on to others. When a message arrives, it comes back and runs the code for that connection. This lets one process keep thousands of mostly idle connections open without creating thousands of workers.

The websocket code itself can be small.

```python
class Messages(tornado.websocket.WebSocketHandler):
    def open(self):
        connections.add(self)

    def on_message(self, message):
        self.write_message(message)

    def on_close(self):
        connections.remove(self)
```

The important part is what happens while this connection is open. Tornado does not leave a worker sitting inside `open`. It registers the connection with the event loop and watches it. When a message arrives, Tornado calls `on_message`. Between messages the process is free to handle other connections.

There is a rule that comes with this approach. Code running on the event loop must not sit and wait. A normal database call waits until Postgres replies. A normal Redis or Elasticsearch call does the same. In Flask that only blocks the worker handling that request. In Tornado it can block the event loop and briefly stop every connection handled by that process.

So I would need to keep blocking calls off the event loop. There are two ways to do that, and each one works on its own. In both cases Tornado uses `yield`. That word means pause here, keep serving other connections, and come back when this result is ready.

The first way is to use an async client. The client itself knows how to wait without freezing Tornado.

```python
@tornado.gen.coroutine
def load_updates(url):
    # pause here while the network wait happens
    # the event loop keeps serving other connections
    response = yield http_client.fetch(url)
    raise tornado.gen.Return(response.body)
```

Postgres or Redis would need the same kind of client. A normal blocking call in this spot would freeze the event loop until it finished.

The second way is to keep the normal blocking libraries and run those calls in a thread pool. The event loop stays free. A worker thread does the waiting.

```python
@tornado.gen.coroutine
def load_notifications(user_id):
    # redis.get is the normal blocking call
    # a thread runs it while Tornado keeps serving others
    notifications = yield thread_pool.submit(redis.get, user_id)
    raise tornado.gen.Return(notifications)
```

This reuses the libraries I already know. The trade is that each waiting call needs a thread, so it does not stretch as far as the async client approach.

Either way solves the same problem. I just have to pick one for the live code.

I could keep Flask and Apache for normal pages and run Tornado as a separate service for websockets. The load balancer could send websocket traffic to Tornado and everything else to Flask. Another option is to put the Flask application behind Tornado using its WSGI container, but that does not make the Flask code async. Its requests still do their work in the usual blocking way.

Either choice means I now run a second kind of server. I have to watch another process, route traffic to it, deploy it alongside everything else, and handle blocking calls carefully in the live code. That is real work and a new thing to break. We are a small team and I am the one who would be paged when it breaks. So I passed on it.

#### Gevent and Eventlet could keep the Flask style

Tornado was not the only option. **Gevent** and **Eventlet** could run Flask code with many lightweight green threads. A green thread looks much like normal synchronous Python code, but it can step aside while it waits for network input or output. Another green thread can then use the same operating system thread.

They often do this through monkey patching. At startup they replace parts of Python such as sockets and `sleep` with cooperative versions.

```python
from gevent import monkey

monkey.patch_all()
```

This lets much of the existing Flask code keep its normal shape. **Flask SocketIO** can then use Gevent or Eventlet underneath.

```python
from flask_socketio import SocketIO

socketio = SocketIO(app)

@socketio.on('message')
def receive_message(message):
    socketio.send(message)

socketio.run(app)
```

The switch between green threads is implicit. It happens when code reaches an operation that Gevent or Eventlet knows how to handle without blocking. It does not happen in the middle of ordinary Python work. A slow calculation still blocks the process. A library that uses an unpatched or unsupported network call can block it too.

This is less rewriting than moving the live code to Tornado, but it is not free. Every library has to behave correctly after patching. Debugging can also be harder because the switch happens inside a call rather than at a visible `yield`. I would also replace Apache and mod_wsgi for this traffic. Common choices were **Gunicorn** with a Gevent or Eventlet worker, Eventlet's own WSGI server, or Gevent's `pywsgi` server. I could run one of those for the whole app, or keep Apache for normal pages and put only the live traffic on that server.

That still means a new server to deploy and debug, plus a patching model I have to trust across Redis, Postgres, and Elasticsearch. For a small team, that is more moving parts than I want right now. So I passed on Gevent and Eventlet too.

#### Server sent events was the other option

There is a lighter option than websockets called server sent events. The server keeps one connection open and pushes updates down to the browser. It only goes one way though, from server to browser. That is fine for notifications, but our messaging is two way. Customers and chefs both send and both receive. So server sent events would cover the notifications and leave the messages out.

That is the main reason I skipped it. I did not want one tool for notifications and a different tool for messages, when one plain approach can carry both. On top of that it still keeps a connection open. Under Apache and mod_wsgi that holds a worker for as long as the stream lasts. That is closer to the long polling capacity problem than to the websocket problem. Websockets fail first because WSGI cannot upgrade the connection. Server sent events can stay on HTTP, but they still leave a worker busy while nothing is happening.

#### What I actually did was polling

I went with polling. The browser asks the server every few seconds if anything is new. If there is, it shows it. If not, it does nothing and asks again a little later.

```javascript
setInterval(function () {
  $.get('/api/updates', { since: lastSeenId }, function (data) {
    if (data.notifications && data.notifications.length > 0) {
      showNotifications(data.notifications);
    }
    if (data.messages && data.messages.length > 0) {
      showMessages(data.messages);
    }
    if (data.lastId) {
      lastSeenId = data.lastId;
    }
  });
}, 5000);
```

The nice part is that this needs nothing new. Each poll request itself is short. The worker only spends a small part of a second running Flask and talking to Postgres or Redis, then the response is done. The Flask code can keep using the normal libraries because waiting on one call only blocks one worker. The load balancer spreads the requests across instances, and the Auto Scaling group handles the extra load the same way it handles normal traffic. It fits the setup I already run.

Polling does hit the same endpoint over and over, so I turned on Apache **KeepAlive**. That keeps the TCP connection open after a response so the next poll can reuse it instead of opening a new connection every few seconds. Without it, each poll would pay for another TCP handshake, and often another TLS handshake too.

KeepAlive is a separate trade from the request length. The Flask work on each poll is still short. Between polls, though, Apache may keep that connection open and a worker can stay tied to that client while it waits for the next request. I set `KeepAliveTimeout` near the poll interval, around 5 seconds, so the next poll can reuse the connection without holding workers much longer than needed. `MaxKeepAliveRequests` stays high enough that one connection can cover many polls.

If this feels like a cheap trick, it is not. Big products already used polling style updates in the browser. Gmail chat refreshed live without websockets by having the client check in with the server over and over. If that approach can serve a product at that scale, it can serve Chef Galaxy at ours.

#### Short polling versus long polling

There are two flavors here. Short polling is what I showed above. The browser asks on a fixed timer and the server answers right away, even if the answer is nothing new.

Long polling is a small twist. The browser asks, and the server waits until there is something to send. If nothing arrives, the server returns an empty response after a set time. The browser then starts another request.

Unlike websockets, long polling can run through WSGI because every connection is still a normal request with a normal response. The problem is capacity. A request waiting for 30 seconds also keeps its worker busy for 30 seconds. With short polling the Flask work itself is usually only a small part of a second. KeepAlive may still hold a worker between polls for a few seconds, but that is much shorter than holding one through a long wait for new data.

Timeouts make long polling more awkward. The Elastic Load Balancer closes an idle connection after 60 seconds by default. Apache and the browser can have their own limits too. I could make long polling return after about 30 or 45 seconds and reconnect before the load balancer cuts it off, but this still needs error handling for dropped connections and it still holds one worker per waiting user for much longer. So I stayed with short polling on a sensible timer.

#### The honest downsides

Polling is not free and it is not perfect. Some requests come back empty, so there is a bit of waste when nothing is happening. And it is not truly instant, there is a small gap between something happening and the next check. For notifications and our messaging, a few seconds of delay is fine. Nobody hiring a chef needs message delivery down to the millisecond.

If Chef Galaxy grows and chat gets heavy, I will come back to this. At that point a small Tornado service just for the live part, or a managed push service, would earn its keep. For now, polling gives us the feel we want without a new server to babysit, and that trade is the right one while we are still small.
