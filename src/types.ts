export interface GrpcRequest {
  // Operation name
  readonly opname?: string;

  // request (mutation/query/subscription)
  readonly request: string;

  // context (json)
  readonly context?: object;

  // request variables (json)
  readonly variableValues?: { [key: string]: any };
}

export interface GrpcResponse {
  // data
  readonly data?: any;

  //  graphql errors/resolver errors
  readonly errors?: any[];
}
