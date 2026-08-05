---
title:  "API migration without breaking workflows"
date: 2021-08-16T12:00:00
categories:
  - backend
  - britecore
---

At BriteCore I changed how our APIs stored and returned data while other teams kept calling the same endpoints. A cleaner design inside the service was easy. Doing it without breaking their apps was not.


#### **JSON Schema for long lived states**

Some of our most important data was not a single row. It was a big nested JSON document that lived for a long time, got edited, and got rated later. Those documents cannot all flip shape on deploy day.

So every document carried a `schema_version`. An old one might look like this.

```json
{"schema_version": "1.0", "customer_name": "Ada"}
```

A newer one renames the field.

```json
{"schema_version": "2.0", "buyer": "Ada"}
```

We kept a JSON Schema file for each version, written in YAML, and validated with the `jsonschema` package. When a document arrived, we read `schema_version` and checked it against that version’s schema file. Required keys, types, and nested structure got caught early, before bad data went further into the system.

That matters more as the document grows. A tiny payload is easy to eyeball. A long nested state is not. Versioned schemas give you a contract per shape, so version 1.0 and version 2.0 can both be valid at the same time without one giant “accept anything” check.


#### **versionary to keep the code tidy**

Validation says the document is shaped right. You still need code that knows how to read and change it. Without help, that code tends to look like this.

```python
def customer_name(order):
    if order["schema_version"] == "1.0":
        return order["customer_name"]
    if order["schema_version"] == "2.0":
        return order["buyer"]
    raise ValueError("unknown schema version")
```

Fine for one field. Ugly once you have dozens of methods and several versions.

We used a Python package called `versionary` instead. One class per shape.

```python
from versionary.decorators import versioned

@versioned()
class OrderReader:
    name_key = "customer_name"

    def __init__(self, order):
        self.order = order

    def customer_name(self):
        return self.order[self.name_key]


@versioned()
class OrderReaderV2(OrderReader.v1):
    name_key = "buyer"
```

`versionary` keeps both on the original name as `.v1` and `.v2`. At runtime you pick from the document.

```python
readers = {
    "1.0": OrderReader.v1,
    "2.0": OrderReader.v2,
}

reader = readers[order["schema_version"]](order)
print(reader.customer_name())
```

Both classes ship in the same deploy. Old behaviour stays in `.v1`. New behaviour lives in `.v2`. No growing pile of `if` branches in one file.


#### **Change storage without changing the response**

Sometimes we split one database table into two. Callers never saw it. We joined the pieces into one response on the way out and split them again on the way in. The JSON stayed familiar even when the tables got stranger.


#### **Hide new behaviour behind a query parameter**

Not every change needs a new endpoint. Optional behaviour went on the query string.

`?deleted=true` also return rows marked deleted.
`?type=minimal` send a smaller response.
`?format=flat` send a flat list instead of a nested one.

Send nothing extra and you get the old behaviour. That is a simple feature flag. Ready clients add one argument. Everyone else keeps working.

That was enough for us. In bigger companies the flag list grows fast, and a query string alone gets hard to manage. Who can see the new path, which tenants are in the rollout, when to turn it off if something breaks. Teams often move that into a dedicated feature flag service instead. [LaunchDarkly](https://launchdarkly.com/) is the name people usually mean. [Unleash](https://www.getunleash.io/) is a common open source option you can host yourself. [Split](https://www.split.io/), now part of Harness, is another. The idea is the same as our query parameter. Default stays safe. Flip a switch when a client or cohort is ready. The service just gives you targeting, audit history, and a kill switch without shipping a new deploy.


#### **The lesson**

If the JSON callers already use stays the same, you did not break them, even if the database behind it changed a lot. Prefer adding fields over renaming or removing them. Put a version number on long lived JSON, validate each version with its own JSON Schema, and keep the Python readers in separate versioned classes.
