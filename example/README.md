# example

## TEST

```
read -r -d '' CYAN_TEST << EOM
  curl -X GET http://127.0.0.1:9090/hello/string/foo?bar=1111 \
  --header "content-type: application/json" \
  --data '{
    "foo": {
      "bar": {
        "baz": 1234
      }
    }
  }'
EOM

watch -n 5 $CYAN_TEST
```