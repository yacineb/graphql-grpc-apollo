# graphql-grpc-apollo
Apollo link  + lightweight graphql server using grpc transport layer


This projet is a prototype for using Grpc as a stransport layer for ApolloGraphQL as an alternative to websocket and Http 1.1

Grpc transport has many adavantages:
- It's faster than vanilla http 1.1 , it's binary, built on top of Http 2.0 and does compression and connexion multiplexing out-of-the-box and other cool features
- It's a standard and plays nicely with k8s, nginx, Traefik, Linkerd 2.0, Istio..
