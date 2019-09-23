import { GrpcRequest, GrpcResponse } from "./types";

import path from "path";
import grpc from "grpc";
import { deserialize } from "./serialization";

const PROTO_PATH = path.resolve(__dirname, "./protos/graphql.proto");

const protoDef = require("@grpc/proto-loader").loadSync(PROTO_PATH);
const { yb } = grpc.loadPackageDefinition(protoDef);
const clients: Map<string, any> = new Map<string, any>();

export class GraphqlGrpcClient {
  /**
   *
   * @param endpoint Grpc service endpoint , example: "localhost:50051"
   */
  constructor(private readonly endpoint: string) {}

  private getClient(endpoint: string) {
    if (clients.has(endpoint)) {
      return clients.get(endpoint);
    }
    const client = new yb["GraphqlService"](
      endpoint,
      grpc.credentials.createInsecure()
    );
    clients.set(endpoint, client);
    return client;
  }

  /**
   *
   * @param req request payload
   */
  public request(req: GrpcRequest) {
    const client = this.getClient(this.endpoint);

    return new Promise<GrpcResponse>((resolve, reject) => {
      client.process(req, function(err, response) {
        if (err) {
          reject(err);
        } else {
          const result = {
            data: deserialize(response.data),
            errors: deserialize(response.errors) as any[],
          };
          resolve(result);
        }
      });
    });
  }
}
