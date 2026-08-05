---
title:  "Why we left GraphQL for REST"
date: 2021-07-05T12:00:00
categories:
  - backend
---

We built our product APIs with GraphQL so clients could ask for the fields they need. We are moving those APIs to REST now. GraphQL is fine, it just did not fit how our product works.

I will use a small example.

* A product has categories.
* A category has settings.
* Products also have versions.


#### **We mostly load and update known things**

GraphQL helps when different screens need different fields from the same data. The developer of each screen already knows what that screen needs. Screen A wants the product name and category names. Screen B wants the product name, settings, and status. Screen C wants almost everything.

The server cannot ship one perfect response for all of them. Without GraphQL you usually pick one of these.

* One fat REST response, and every screen gets fields it ignores
* Many small REST calls
* Many custom endpoints, one per screen

GraphQL lets each screen ask for its own field list in the query.

That was not our main problem. Almost every request already knew which thing it wanted, like get this product, update this category, or change this setting.

```python
# GraphQL
query = """
query GetProduct($id: ID!) {
  product(id: $id) {
    name
    categories {
      name
    }
  }
}
"""

# REST
# GET /products/home-insurance
# GET /products/home-insurance/categories
```

When you already know which product or category you want, a URL is easier to follow than a query. We already knew which one we wanted, and we did not need a custom field list for each screen.


#### **We had to pass the same ids over and over**

In plain GraphQL, nesting is usually enough. You ask for a post and its comments. A comment belongs to one post only, so the server already has that post from the parent and you do not send the post id again.

```python
query = """
query {
  post(id: "42") {
    title
    comments {
      text
    }
  }
}
"""
```

Our settings did not work like comments. A category name alone was not enough to load settings. Settings for `roof` under product `home` in version 3 are not the same as settings for `roof` under another product, or under version 5. So the nested `settings` field needed product and version, not only the parent category.

```python
query = """
query {
  product(id: "home") {
    categories(product_id: "home") {
      name
      settings(product_id: "home", version_id: "v3") {
        key
        value
      }
    }
  }
}
"""
```

That is why `product_id` shows up again. The parent category did not carry "I am roof inside product home at version v3." Comments do not need that extra scope, our settings did.

In short, we kept passing the same ids through nested fields that did not really use them, just so a deeper field could finally use them. `categories` takes `product_id` mainly to push it down. `settings` is where that id actually matters. That gets noisy fast, and it is easy to pass the wrong value somewhere in the middle.

In REST the URL holds that scope once.

```python
# GET /products/home/categories?version=v3
# GET /products/home/categories/roof/settings?version=v3

def get_category_settings(product_name, category_name, version):
    product = load_product(product_name, version)
    category = product.get_category(category_name)
    return category.settings
```


#### **Writes are clearer as normal API actions**

We do not only read data, we also publish a product, which means take a draft and make it live.

In GraphQL that is a mutation.

```python
mutation = """
mutation {
  publishProduct(
    productId: "home"
    versionId: "v3"
  ) {
    status
  }
}
"""
```

In REST it is a normal endpoint.

```python
# POST /products/home/publish?version=v3

def publish_product(product_name, version):
    product = load_product(product_name, version)
    if product.status != "draft":
        raise ValueError("only drafts can be published")
    product.status = "live"
    product.save()
    return product
```

REST status codes are also easy to use. `201` means created, `400` means bad input, and `409` means the version is locked. With GraphQL you often get `200` even when something failed, and the error sits in the response body.


#### **Permissions are easier with URLs**

We need to answer simple questions, like can this user update this category, or can they publish this product?

With REST we can map that to the path and method.

```python
PERMISSIONS = {
    ("GET", "/products/{product}/categories"): "category.read",
    ("PATCH", "/products/{product}/categories/{category}"): "category.update",
    ("POST", "/products/{product}/publish"): "product.publish",
}


def allow(user, method, path):
    rule = match_permission(method, path)
    return user.has_perm(rule)
```

GraphQL has one URL for everything. The gateway only sees `POST /graphql`, and the real action is inside the query. You can still check permissions in code, but it takes more work and it is easier to miss a field.

We also had extra auth rules for GraphQL, like skipping normal CSRF checks. REST uses the usual web rules.


#### **When GraphQL still makes sense**

GraphQL is useful when many clients need different fields from the same data, and those needs change a lot.

That was not our case. We work with products, categories, settings, and versions, and most calls already know which one they want.

So we put that in the URL once with REST, instead of passing the same ids through nested GraphQL fields.
