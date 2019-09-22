import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  execute,
  parse,
} from "graphql";

//
const numberHolderType = new GraphQLObjectType({
  fields: {
    theNumber: { type: GraphQLInt },
  },
  name: "NumberHolder",
});

class NumberHolder {
  theNumber: number;

  constructor(originalNumber: number) {
    this.theNumber = originalNumber;
  }
}

class Root {
  numberHolder: NumberHolder;

  constructor(originalNumber: number) {
    this.numberHolder = new NumberHolder(originalNumber);
  }

  immediatelyChangeTheNumber(newNumber: number): NumberHolder {
    this.numberHolder.theNumber = newNumber;
    return this.numberHolder;
  }

  failToChangeTheNumber(): NumberHolder {
    throw new Error("Cannot change the number");
  }

  promiseAndFailToChangeTheNumber(): Promise<NumberHolder> {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        reject(new Error("Cannot change the number"));
      });
    });
  }
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    fields: {
      numberHolder: { type: numberHolderType },
    },
    name: "Query",
  }),
  mutation: new GraphQLObjectType({
    fields: {
      immediatelyChangeTheNumber: {
        type: numberHolderType,
        args: { newNumber: { type: GraphQLInt } },
        resolve(obj, { newNumber }) {
          return obj.immediatelyChangeTheNumber(newNumber);
        },
      },
    },
    name: "Mutation",
  }),
});

const doc = `mutation M {
  first: immediatelyChangeTheNumber(newNumber: 2) {
    theNumber
  }
}`;

(async function main() {
  const result = await execute(schema, parse(doc), new Root(6));
  console.info(JSON.stringify(result, null, 2));
})();
