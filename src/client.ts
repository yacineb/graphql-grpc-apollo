var path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')

const PROTO_PATH = path.resolve(__dirname, './protos/graphql.proto')

const pd = protoLoader.loadSync(PROTO_PATH)
const {yb} = grpc.loadPackageDefinition(pd)

import {serialize} from "./serialization"

function main () {
  var client = new yb.GraphqlService('localhost:50051', grpc.credentials.createInsecure())
  
  const request = {
    opname: "test",
    request: "hola",
    variableValues : serialize({a: 12 })
  }
  client.process(request, function (err, response) {
    if (err){
      console.error("request fail",err)
    }
    else {
      console.log('Greeting:', response.data.toString())
    }
  })
}

main()