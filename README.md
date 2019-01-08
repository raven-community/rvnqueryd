# rvnqueryd

## 1. What is rvnquery?

rvnquery is a **Turing complete query language for building immutable API on Ravencoin**.

![f](./img/f.png)

rvnquery is a **portable**, **self-contained**, and **programmable** query language that lets you:

1. **Query** ravencoin (via [rvndb](http://rvndb.ravencoin.online)) using a [mongodb query language](https://docs.mongodb.com/manual/tutorial/query-documents/)
2. **Process** the result using [jq](https://en.wikipedia.org/wiki/Jq_(programming_language)), a turing complete functional programming language
3. All within a single **self-contained declarative query language**.

![q](./img/q.png)

Top level attributes:

- v: version
- q: query (MongoDB query)
- r: response handler (powered by [jq](https://stedolan.github.io/jq/))

> Learn more here: [https://docs.bitdb.network](https://docs.bitdb.network)

With this combination, you can create your own custom API that's:

- **portable:** written in JSON, it's natively supported by all devices, OS, programming languages, and databases.
- **self-contained:** since the processing function can transform the query result into any format, the query can act as a high level API.
- **programmable:** combine with other queries to build apps that talk to one another based on ravencoin state

## 2. Build your own API from Ravencoin!

Here's a simple rvnquery (You can learn more about the syntax [here](https://docs.bitdb.network/query))

```
{
  "v": 3,
  "q": {
    "find": { "out.h1": "6d0c" },
    "project": { "out.$": 1 }
  }
}
```

When you send the query to a rvndb node, it will respond with the following result:

![raw](./img/raw.png)

Already super useful, but it's still raw because every item in the response is a full transaction.

We can go further by adding a **processing** step:


```
{
  "v": 3,
  "q": {
    "find": { "out.h1": "6d0c" },
    "project": {
      "out.$": 1
    }
  },
  "r": {
    "f": "[ [ .[] | .out[0] ] | group_by(.s2)[] | { topic: .[0].s2, messages: [ .[] | .s3 ] } ]"
  }
}
```

The `"r.f"` is written in [jq](https://stedolan.github.io/jq/), a [Turing complete](https://github.com/MakeNowJust/bf.jq) data processing language.

Thanks to this additional step, this will respond with:

![api](./img/api.png)

To summarize, with rvnquery:

1. **Flexible Query:** You can write a portable JSON query to read from the blockchain.
2. **Response Processing:** You can also add additional step to represent the processing logic, which will return your own custom immutable stream of data from ravencoin, or also known as **API**.
2. **Interoperable:** When you mix and match these APIs together, you can create applications that trigger and talk to one another in a deterministic manner.

---

# rvnqueryd

## 1. What is rvnqueryd?

rvnqueryd is a query engine that:

1. Connects to a [rvndb](https://rvndb.ravencoin.online) node and
2. Let you interact with rvndb using the **rvnquery** language.


## 2. prerequisites

rvnqueryd is a query engine that directly interfaces with a RvnDB node. You must have direct access to a RvnDB node through either a local or remote MongoDB URL. (An HTTP based module to come soon)

> This library is for connecting directly to a RvnDB MongoDB instance through `mongodb://` url and is not for HTTP access. If you're looking for a public HTTP endpoint, this library is not what you're looking for. You can instead use the HTTP-based API endpoint at [rvndb.ravencoin.online](http://rvndb.ravencoin.online), which takes only a couple of minutes to get your app up and running.

## 3. install

```
npm install --save rvnqueryd
```

## 4. usage

First initialize, and use the returned db object to make the query. 

### A. Using Promises


```
var rvnqueryd = require('rvnqueryd')
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
}
rvnqueryd.init().then(function(db) {
  db.read(bql).then(function(response) {
    console.log("Response = ", response)
  })
})
```

### B. Using Async-Await

```
var rvnqueryd = require('rvnqueryd')
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
};
(async function () {
  let db = await rvnqueryd.init();
  let response = await db.read(bql);
  console.log("Response = ", response)
})();
```

> Note: By default rvnquery connects to `mongodb://localhost:27017` so you don't need to configure anything if you set up RvnDB without changing anything.


## 5. configuration

You can set the following two options:

1. **url:** RvnDB Node URL
2. **timeout:** Request timeout

### A. url

Select the RvnDB URL to connect to. 

```
rvnqueryd.init({
  url: "mongodb://localhost:27017"
}).then(function(db) {
  ...
})
```

### B. timeout

Set request timeout in milliseconds. All RvnDB requests will time out after this duration.

```
rvnqueryd.init({
  timeout: 20000
}).then(function(db) {
  ...
})
```
