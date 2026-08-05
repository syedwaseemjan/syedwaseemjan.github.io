---
title:  "Raising coverage to 92% with 900+ tests"
date: 2021-06-14T12:00:00
categories:
  - backend
  - britecore
---

At BriteCore I work on BriteLines. We migrated our suite from Django `TestCase` style to pytest, crossed **900 tests**, and landed near **92%** coverage on the app code we chose to measure.


#### **What we measured**

We counted coverage under the application packages. Settings, migrations, and the tests themselves stayed out of the report. We also skipped trivial model fields, thin vendor wrappers, and a hard 100% bar. New code needed tests in review. Once that was normal, the coverage number went up on its own.


#### **Asserts before and after**

Django and unittest push you toward helpers.

```python
self.assertEqual(result["status"], "active")
self.assertTrue(user.is_active)
self.assertIn("email", payload)
self.assertRaises(ValidationError, validate_name, "bad name")
```

pytest is just Python.

```python
assert result["status"] == "active"
assert user.is_active is True
assert "email" in payload
with pytest.raises(ValidationError):
    validate_name("bad name")
```

When an assert fails, pytest prints both sides. That alone removed a lot of temporary prints from our debugging.


#### **Parametrize**

Same test body, many inputs.

```python
@pytest.mark.parametrize(
    "value, expected",
    [
        (None, False),
        ("", False),
        ("HO3", True),
        ("  ", False),
    ],
)
def test_is_present(value, expected):
    assert is_present(value) is expected
```

Errors work the same way.

```python
@pytest.mark.parametrize("value", ["bad name", "for", ""])
def test_validate_name_rejects(value):
    with pytest.raises(ValidationError, match="invalid"):
        validate_name(value)
```


#### **Fixtures and mocker**

An autouse fixture replaces `setUp`. `mocker` replaces `unittest.mock.patch` and cleans up on its own.

```python
@pytest.mark.django_db
class TestUserCache:
    @pytest.fixture(autouse=True)
    def setup_tests(self):
        self.user = UserFactory()

    def test_cache_miss(self, mocker):
        cache_mock = mocker.patch("myapp.services.cache")
        cache_mock.get.return_value = None
        save = mocker.patch.object(UserCache, "save", return_value=None)

        UserCache(self.user).data

        assert cache_mock.get.called is True
        assert save.called is True
```

Mark database tests with `@pytest.mark.django_db`. Leave it off when the code under test is pure.


#### **Freeze time**

```python
@pytest.fixture
@freeze_time("2020-01-01")
def frozen_date():
    return date.today()


def test_invoice_due_date(frozen_date):
    invoice = build_invoice(days=30)
    assert invoice.due_date == date(2020, 1, 31)
```


#### **pytest.raises with details**

```python
with pytest.raises(ValidationError, match="too short") as err:
    validate_password("ab")
assert err.value.code == "min_length"
```

Type, message, and fields in one block.


#### **Keep the suite fast**

We run `pytest -n auto` with xdist so local and CI use multiple CPUs. Feedback stays short enough that people keep adding tests.


#### **What stuck**

Convert `TestCase` modules gradually. Prefer plain asserts, parametrize, fixtures, and `mocker`. Measure app code only. Skip tests that teach nothing. Make each test cheap to write and the coverage number mostly takes care of itself.
