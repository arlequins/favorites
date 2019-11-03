curl -XPUT "http://localhost:19200/_template/favirotes-v1?pretty" -H 'Content-Type: application/json' -d '{
  "template": "favirotes-v1",
  "settings": {
    "index": {
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "max_inner_result_window": 100000
    }
  }, "mappings": {
    "properties": {
      "type": {
        "type": "keyword"
      },
      "uniqueId": {
        "type": "keyword"
      },
      "typeId": {
        "type": "integer"
      },
      "@timestamp": {
        "type": "date"
      },
      "@version": {
        "type": "integer"
      },
      "metajoin": {
        "type": "join",
        "eager_global_ordinals": true,
        "relations": {
          "primary": "meta"
        }
      }
    }
  }
}'

curl -XDELETE "http://localhost:19200/favirotes-v1"

curl -XPUT "http://localhost:19200/favirotes-v1?pretty" -H 'Content-Type: application/json' -d '{
  "settings": {
    "index": {
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "max_inner_result_window": 100000
    }
  },
  "mappings": {
    "properties": {
      "type": {
        "type": "keyword"
      },
      "uniqueId": {
        "type": "keyword"
      },
      "typeId": {
        "type": "integer"
      },
      "@timestamp": {
        "type": "date"
      },
      "@version": {
        "type": "integer"
      },
      "metajoin": {
        "type": "join",
        "relations": {
          "primary": "meta"
        }
      }
    }
  }
}'

curl -H 'Content-type: application/x-ndjson' -XPOST "http://localhost:19200/_bulk?pretty" --data-binary @request_bulk.json

# search from child with other options
curl -XPOST 'http://localhost:19200/favirotes-v1/_search?pretty' -H 'Content-Type: application/json' -d '{
  "query": {
    "bool" : {
      "must" : [
        { "parent_id": { "type": "meta", "id": "uniqueid1_0_0001" } },
        { "term" : { "typeId" : 0 } },
        { "term" : { "code" : "0001" } }
      ],
      "disable_coord" : false,
      "adjust_pure_negative" : true,
      "boost" : 1.0
    }
  }
}'

# search by uniqueId with other options
curl -XGET "http://localhost:19200/favirotes-v1/_search?pretty" -H 'Content-Type: application/json' -d '{
  "query": {
    "bool" : {
      "must" : [
        { "term" : { "_id" : "uniqueid1_0_0001" } },
        { "term" : { "type" : "primary" } },
        { "term" : { "typeId" : 0 } },
        { "term" : { "code" : "0001" } }
      ],
      "disable_coord" : false,
      "adjust_pure_negative" : true,
      "boost" : 1.0
    }
  }
}'

# search by parent code and child code
curl -XGET 'http://localhost:19200/favirotes-v1/_search?pretty' -H 'Content-Type: application/json' -d '{
  "query": {
    "bool" : {
      "must" : [
        { "term" : { "_id" : "uniqueid1_0_0001" } },
        { "term" : { "type" : "primary" } },
        { "term" : { "typeId" : 0 } },
        { "term" : { "code" : "0001" } },
        {
          "has_child" : {
            "type" : "meta",
            "query" : {
              "bool" : {
                "must" : [
                  { "term" : { "typeId" : 0 } },
                  { "term" : { "code" : "0001" } }
                ],
                "disable_coord" : false,
                "adjust_pure_negative" : true,
                "boost" : 1.0
              }
            }
          }
        }
      ]
    }
  }
}'

# search by parent with typeId
curl -XGET 'http://localhost:19200/favirotes-v1/_search?pretty' -H 'Content-Type: application/json' -d '{
  "query": {
    "bool" : {
      "must" : [
        { "term" : { "_id" : "uniqueid1_0_0001" } },
        { "term" : { "type" : "primary" } },
        { "term" : { "typeId" : 0 } },
        {
          "has_child" : {
            "type" : "meta",
            "query" : {
              "bool" : {
                "must" : [
                  { "term" : { "typeId" : 0 } }
                ],
                "disable_coord" : false,
                "adjust_pure_negative" : true,
                "boost" : 1.0
              }
            },
            "inner_hits": {}
          }
        }
      ]
    }
  }
}'
