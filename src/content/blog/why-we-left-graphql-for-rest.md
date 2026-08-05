---
title:  "Why we left GraphQL for REST"
date: 2021-07-05T12:00:00
categories:
  - backend
---

We built our product APIs on GraphQL so clients could ask for exactly the fields they need. We recently moved them to REST. GraphQL is fine, it just did not fit how our product works.

I will use a small example.

* A product has categories.
* A category has settings.
* Products also have versions.


#### **We mostly load and update known things**

GraphQL is great when different screens need different fields from the same data. The developer of each screen already knows what that screen needs. Screen A wants the product name and category names. Screen B wants the product name, settings, and status. Screen C wants almost everything.

The server cannot ship one perfect response for all of them. Without GraphQL you usually pick one of these.

* One fat REST response, and every screen gets fields it ignores
* Many small REST calls
* Many custom endpoints, one per screen

GraphQL lets each screen ask for its own field list in the query. That is a real strength, but it was not our problem.

Our problem was different. Almost every request already knew the exact thing it wanted, like get this product, update this category, or change this setting. The hard part was pointing at that thing, not choosing which fields to return.

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

When you already know which product or category you want, a URL is easier to follow than a query.


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

Our settings did not work like that. The same category name meant different settings depending on which product and version you were in. Settings for `roof` under product `home` at version `v3` are not the same as settings for `roof` under another product, or under version `v5`.

You would expect that once we picked the product and its version at the top, the nested fields could just read that scope from the parent. Ours did not. Each nested field asked for the version again.

```python
query = """
query {
  product(id: "home", version: "v3") {
    categories {
      name
      inheritance_status(version_id: "v3")
      settings(version_id: "v3") {
        key
        value
      }
    }
  }
}
"""
```

Notice `v3` shows up three times. The product already knew its version, but the fields under it did not read that from the parent, so every one asked again. That gets noisy fast, and it is easy to pass the wrong value on one of them.

This is fixable in GraphQL. If every parent object carries its product and version, the children can read that scope from the parent instead of taking it as an argument. But our data had inheritance and versioning, so keeping every level correctly scoped was fiddly, and the arguments kept creeping back in.

In REST the URL holds that scope once, and every level below inherits it for free.

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

GraphQL is a good fit when many clients need different fields from the same data, and those needs change a lot. If we were building a rich dashboard over loosely related data, we would think hard about keeping it.

That was not our case. We work with products, categories, settings, and versions, and most calls already know which one they want. Putting that scope in the URL made reads, writes, and permission checks all line up with how we already thought about the system.

So we moved those pieces to REST and kept the rest simple.
