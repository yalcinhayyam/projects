// src/utils/graphqlHelpers.ts
import { ApolloError } from "@apollo/client";

type ThunkAPI<T = any> = any;

interface GraphQLErrorExtensions {
  code?: string;
  [key: string]: any;
}

interface GraphQLError {
  message: string;
  extensions?: GraphQLErrorExtensions;
}

export const handleGraphQLError = (error: unknown, thunkAPI: ThunkAPI<any>) => {
  if (error instanceof ApolloError) {
    // GraphQL hatalarını ayrıştır
    const firstError = error.graphQLErrors[0];
    const errorMessage = firstError?.message || error.message;
    const errorCode = firstError?.extensions?.code || "UNKNOWN_ERROR";

    return thunkAPI.rejectWithValue({
      message: errorMessage,
      code: errorCode,
      details: error.graphQLErrors,
    });
  }

  // Network veya diğer hatalar
  return thunkAPI.rejectWithValue({
    message: (error as Error).message || "Unknown error occurred",
    code: "NETWORK_ERROR",
  });
};

export const executeQuery = async <T = any, V = any>(
  query: any,
  variables?: V,
  thunkAPI?: ThunkAPI<any>
): Promise<T> => {
  try {
    const { data } = await client.query<T, V>({
      query,
      variables,
      fetchPolicy: "network-only", // Önbellek yerine her zaman sunucudan al
    });

    // Sorgu adını dinamik olarak al (örneğin "GetPosts" sorgusu için "posts" döner)
    const queryName = Object.keys(data)[0];
    return data[queryName];
  } catch (error) {
    if (thunkAPI) throw handleGraphQLError(error, thunkAPI);
    throw error;
  }
};

export const executeMutation = async <T = any, V = any>(
  mutation: any,
  variables?: V,
  thunkAPI?: ThunkAPI<any>
): Promise<T> => {
  try {
    const { data } = await client.mutate<T, V>({
      mutation,
      variables,
    });

    // Mutasyon adını dinamik olarak al (örneğin "CreatePost" mutasyonu için "createPost" döner)
    const mutationName = Object.keys(data!)[0];
    return data![mutationName];
  } catch (error) {
    if (thunkAPI) throw handleGraphQLError(error, thunkAPI);
    throw error;
  }
};
