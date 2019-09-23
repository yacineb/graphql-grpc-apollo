import { ApolloLink, Observable, Operation } from "apollo-link";
import { GraphqlGrpcClient } from "./GraphqlGrpcClient";
import { GqlRequest } from "./types";
import { print } from "graphql/language/printer";
export interface Options {
  /**
   * gRpc server endpoint
   */
  endpoint: string;
}

function mapToGqlRequest(operation: Operation): GqlRequest {
  const { operationName, extensions, variables, query } = operation;
  const request = print(query);

  return {
    context: operation.getContext(),
    request: request,
    variableValues: variables,
    extensions,
    opname: operationName,
  };
}

// todo implement operation abort
export const createGrpcLink = (options: Options) => {
  const client = new GraphqlGrpcClient(options.endpoint);
  return new ApolloLink(operation => {
    const req = mapToGqlRequest(operation);

    return new Observable(observer => {
      client
        .request(req)
        .then(response => {
          operation.setContext({ response });
          return response;
        })
        .then(result => {
          // we have data and can send it to back up the link chain
          observer.next(result);
          observer.complete();
          return result;
        })
        .catch(err => {
          // fetch was cancelled so it's already been cleaned up in the unsubscribe
          if (err.name === "AbortError") return;
          // if it is a network error, BUT there is graphql result info
          // fire the next observer before calling error
          // this gives apollo-client (and react-apollo) the `graphqlErrors` and `networErrors`
          // to pass to UI
          // this should only happen if we *also* have data as part of the response key per
          // the spec
          if (err.result && err.result.errors && err.result.data) {
            // if we don't call next, the UI can only show networkError because AC didn't
            // get any graphqlErrors
            // this is graphql execution result info (i.e errors and possibly data)
            // this is because there is no formal spec how errors should translate to
            // http status codes. So an auth error (401) could have both data
            // from a public field, errors from a private field, and a status of 401
            // {
            //  user { // this will have errors
            //    firstName
            //  }
            //  products { // this is public so will have data
            //    cost
            //  }
            // }
            //
            // the result of above *could* look like this:
            // {
            //   data: { products: [{ cost: "$10" }] },
            //   errors: [{
            //      message: 'your session has timed out',
            //      path: []
            //   }]
            // }
            // status code of above would be a 401
            // in the UI you want to show data where you can, errors as data where you can
            // and use correct http status codes
            observer.next(err.result);
          }
          observer.error(err);
        });
    });
  });
};
