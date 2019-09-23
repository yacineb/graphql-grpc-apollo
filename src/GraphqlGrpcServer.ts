import path from "path";
import Mali from "mali";

import { serialize, deserialize } from "./serialization";
import { GraphQLSchema, parse } from "graphql";
import { execute } from "graphql/execution";
import { GrpcRequest } from "./types";

//request pipeline
// https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-core/src/requestPipeline.ts

//build schema
//https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-core/src/ApolloServer.ts

export interface ServerConfig {
  endpoint: string;
  schema: GraphQLSchema;
}
export class GraphqlGrpcServer {
  constructor(protected readonly config: ServerConfig) {}

  /**
   * Decodes incoming
   * @param request incoming Grpc message
   */
  public decode(request: Mali.Request): GrpcRequest {
    return {
      opname: request.req.opname as string,
      request: request.req.request as string,
      context: deserialize(request.req.context),
      variableValues: deserialize(request.req.variableValues),
    };
  }

  private async processGqlRequest(req: GrpcRequest) {
    const requestDoc = parse(req.request);

    const graphqlResult = await execute({
      schema: this.config.schema,
      document: requestDoc,
      variableValues: req.variableValues,
      operationName: req.opname,
      contextValue: req.context,
    });

    const errors = graphqlResult.errors
      ? serialize(graphqlResult.errors)
      : undefined;
    const data = graphqlResult.data ? serialize(graphqlResult.data) : undefined;

    return {
      data,
      errors,
    };
  }

  public async start() {
    const protoPath = path.join(__dirname, "./protos/graphql.proto");

    const app = new Mali(protoPath);

    app.use({
      process: async (ctx: Mali.Context) => {
        const graphqlReq = this.decode(ctx.request);

        console.info(
          "Received request\n" + JSON.stringify(graphqlReq, null, 2)
        );
        ctx.res = await this.processGqlRequest(graphqlReq);
      },
    });

    return app.start(this.config.endpoint);
  }
}
