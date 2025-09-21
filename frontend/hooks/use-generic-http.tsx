import axiosConfig from '@/axios-config';
import { zodEndpointValidation } from '@/utils/zod-endpoint-validator';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { Method } from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslatedUtils } from './utils';

// Helper functions
const isQueryMethod = (method: Method): boolean => {
  const queryMethods: Method[] = ['GET', 'get', 'HEAD', 'head', 'OPTIONS', 'options'];
  return queryMethods.includes(method);
};

const isMutationMethod = (method: Method): boolean => {
  const mutationMethods: Method[] = [
    'POST',
    'post',
    'PUT',
    'put',
    'PATCH',
    'patch',
    'DELETE',
    'delete',
    'PURGE',
    'purge',
    'LINK',
    'link',
    'UNLINK',
    'unlink',
  ];
  return mutationMethods.includes(method);
};

// Generic HTTP request function
function createHttpRequest<TData = unknown, TVariables = unknown>(
  endpoint: string | null,
  method: Method,
  zodDataSchema: z.ZodType,
  urlQueries?: { [key: string]: string | number } | null,
  isFormData?: boolean,
) {
  return async (payload?: TVariables): Promise<TData | null> => {
    if (endpoint === null) return null;

    try {
      const config = {
        params: urlQueries,
        ...(isFormData
          ? {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          : {}),
      };

      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await axiosConfig.get(endpoint, config);
          break;
        case 'post':
          response = await axiosConfig.post(endpoint, payload, config);
          break;
        case 'put':
          response = await axiosConfig.put(endpoint, payload, config);
          break;
        case 'patch':
          response = await axiosConfig.patch(endpoint, payload, config);
          break;
        case 'delete':
          response = await axiosConfig.delete(endpoint, config);
          break;
        case 'head':
          response = await axiosConfig.head(endpoint, config);
          break;
        case 'options':
          response = await axiosConfig.options(endpoint, config);
          break;
        default:
          response = await axiosConfig.request({
            ...config,
            method,
            url: endpoint,
            data: payload,
          });
      }

      const responseValidation = zodEndpointValidation(zodDataSchema, response.data);
      if (!responseValidation.success) {
        if (process.env.NODE_ENV === 'development') {
          toast.warning('Something went wrong, check console');
          console.error('Validation data failed', responseValidation.error);
        }
      }
      return response.data as TData;
    } catch (error) {
      console.error(`HTTP ${method.toUpperCase()} request failed:`, error);
      return null;
    }
  };
}

/**
 * Generic HTTP request hook that automatically chooses between useQuery and useMutation
 * based on the HTTP method provided.
 *
 * @template TData - The type of data returned from the API
 * @template TVariables - The type of variables/payload for mutations (optional for queries)
 * @template TError - The type of error that might be thrown
 * @template TQueryKey - The type of the query key array
 *
 * @param {Object} params - Configuration object for the HTTP request
 * @param {string | null} params.endpoint - The API endpoint URL. If null, the request won't be made
 * @param {Method} [params.httpMethod='GET'] - HTTP method to use (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, etc.)
 * @param {z.ZodType} params.zodDataSchema - Zod schema for validating the API response
 * @param {Object} [params.urlQueries=null] - URL query parameters to append to the endpoint
 * @param {UseQueryOptions} [params.queryOptions] - React Query options (required for query methods: GET, HEAD, OPTIONS)
 * @param {UseMutationOptions} [params.mutationOptions] - React Query mutation options (optional for mutation methods)
 * @param {boolean} [params.isFormData=false] - Set to true for file uploads or FormData requests
 *
 * @returns {Object} Returns different objects based on the HTTP method:
 * - For query methods (GET, HEAD, OPTIONS): Returns useQuery result with type: 'query'
 * - For mutation methods (POST, PUT, PATCH, DELETE, etc.): Returns useMutation result with type: 'mutation'
 *
 * @throws {Error} Throws error if queryOptions is missing for query methods or if unsupported HTTP method is used
 *
 * @example
 * // GET request - automatically uses useQuery
 * const { data, isLoading, error, type } = useGenericHttp({
 *   endpoint: '/api/users',
 *   httpMethod: 'GET', // or omit for default GET
 *   zodDataSchema: z.array(z.object({
 *     id: z.number(),
 *     name: z.string(),
 *     email: z.string()
 *   })),
 *   queryOptions: {
 *     queryKey: ['users'],
 *     staleTime: 5 * 60 * 1000, // 5 minutes
 *     refetchOnWindowFocus: false
 *   }
 * });
 * // type === 'query'
 * // Access: data, isLoading, error, refetch, etc.
 *
 * @example
 * // POST request - automatically uses useMutation
 * const { mutate, isPending, error, type } = useGenericHttp({
 *   endpoint: '/api/users',
 *   httpMethod: 'POST',
 *   zodDataSchema: z.object({
 *     id: z.number(),
 *     name: z.string(),
 *     email: z.string()
 *   }),
 *   mutationOptions: {
 *     onSuccess: (data) => {
 *       console.log('User created:', data);
 *       // Invalidate users query to refetch the list
 *       queryClient.invalidateQueries({ queryKey: ['users'] });
 *     },
 *     onError: (error) => {
 *       console.error('Failed to create user:', error);
 *     }
 *   }
 * });
 * // type === 'mutation'
 * // Usage: mutate({ name: 'John', email: 'john@example.com' })
 *
 * @example
 * // PUT request for updating
 * const updateUser = useGenericHttp({
 *   endpoint: '/api/users/123',
 *   httpMethod: 'PUT',
 *   zodDataSchema: userSchema,
 *   mutationOptions: {
 *     onSuccess: (updatedUser) => {
 *       console.log('User updated:', updatedUser);
 *     }
 *   }
 * });
 * // Usage: updateUser.mutate({ id: 123, name: 'John Updated', email: 'john.new@example.com' })
 *
 * @example
 * // DELETE request
 * const deleteUser = useGenericHttp({
 *   endpoint: '/api/users/123',
 *   httpMethod: 'DELETE',
 *   zodDataSchema: z.object({ success: z.boolean() }),
 *   mutationOptions: {
 *     onSuccess: () => {
 *       console.log('User deleted successfully');
 *     }
 *   }
 * });
 * // Usage: deleteUser.mutate() or deleteUser.mutate(undefined)
 *
 * @example
 * // File upload with FormData
 * const uploadFile = useGenericHttp({
 *   endpoint: '/api/upload',
 *   httpMethod: 'POST',
 *   zodDataSchema: z.object({
 *     fileUrl: z.string(),
 *     fileName: z.string()
 *   }),
 *   isFormData: true,
 *   mutationOptions: {
 *     onSuccess: (data) => {
 *       console.log('File uploaded:', data.fileUrl);
 *     }
 *   }
 * });
 * // Usage:
 * // const formData = new FormData();
 * // formData.append('file', file);
 * // uploadFile.mutate(formData);
 *
 * @example
 * // With URL query parameters
 * const paginatedUsers = useGenericHttp({
 *   endpoint: '/api/users',
 *   httpMethod: 'GET',
 *   zodDataSchema: paginationSchema,
 *   urlQueries: {
 *     page: 1,
 *     limit: 10,
 *     sort: 'name',
 *     filter: 'active'
 *   },
 *   queryOptions: {
 *     queryKey: ['users', 'paginated', { page: 1, limit: 10, sort: 'name', filter: 'active' }]
 *   }
 * });
 *
 * @example
 * // TypeScript usage with specific types
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * interface CreateUserPayload {
 *   name: string;
 *   email: string;
 * }
 *
 * const createUser = useGenericHttp<User, CreateUserPayload>({
 *   endpoint: '/api/users',
 *   httpMethod: 'POST',
 *   zodDataSchema: userSchema,
 *   mutationOptions: {
 *     onSuccess: (user: User | null) => {
 *       if (user) {
 *         console.log('Created user with ID:', user.id);
 *       }
 *     }
 *   }
 * });
 *
 * @example
 * // Custom query function (overrides the built-in request function)
 * const customQuery = useGenericHttp({
 *   endpoint: '/api/users', // Can be null since we're using custom queryFn
 *   httpMethod: 'GET',
 *   zodDataSchema: usersSchema,
 *   queryOptions: {
 *     queryKey: ['users', 'custom'],
 *     queryFn: async () => {
 *       // Your custom fetch logic
 *       const response = await fetch('/api/custom-endpoint');
 *       return response.json();
 *     }
 *   }
 * });
 *
 * @since 1.0.0
 */
// Main generic hook
export function useGenericHttp<
  TData = unknown,
  TVariables = unknown,
  TError = Error,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>({
  endpoint,
  httpMethod = 'GET',
  zodDataSchema,
  urlQueries = null,
  queryOptions,
  mutationOptions,
  isFormData = false,
}: {
  endpoint: string | null;
  httpMethod?: Method;
  zodDataSchema: z.ZodType;
  urlQueries?: { [key: string]: string | number } | null;
  queryOptions?: UseQueryOptions<TData | null, TError, TData | null, TQueryKey>;
  mutationOptions?: UseMutationOptions<TData | null, TError, TVariables>;
  isFormData?: boolean;
}) {
  const { logError, logSuccess } = useTranslatedUtils();
  const t = useTranslations('Fetching');

  const requestFunction = createHttpRequest<TData, TVariables>(
    endpoint,
    httpMethod,
    zodDataSchema,
    urlQueries,
    isFormData,
  );

  const isQuery = isQueryMethod(httpMethod);
  const isMutation = isMutationMethod(httpMethod);

  // Always call hooks unconditionally
  const queryFunction = () => requestFunction();

  const defaultQueryOptions = {
    queryKey: [] as unknown as TQueryKey,
    enabled: false,
  };

  const query = useQuery({
    ...(queryOptions || defaultQueryOptions),
    queryFn: queryOptions?.queryFn || queryFunction,
    enabled: isQuery && endpoint !== null && (queryOptions?.enabled ?? true),
    refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? false,
  });

  const mutation = useMutation({
    mutationFn: requestFunction,
    onSuccess: (response, variables, context, mutation) => {
      if (response !== null) {
        switch (httpMethod.toLowerCase()) {
          case 'post':
            logSuccess(t('dataSubmittedSuccessfully'));
            break;
          case 'put':
          case 'patch':
            logSuccess(t('dataUpdatedSuccessfully'));
            break;
          case 'delete':
            logSuccess(t('dataDeletedSuccessfully'));
            break;
          default:
            logSuccess(t('operationCompletedSuccessfully'));
        }
      }
      mutationOptions?.onSuccess?.(response, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      logError(error);
      mutationOptions?.onError?.(error, variables, context, mutation);
    },
    ...mutationOptions,
  });

  // Validate required options and return appropriate result
  if (isQuery) {
    if (!queryOptions) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`queryOptions is required for query methods (${httpMethod})`);
      }
    }
    return { type: 'query', ...query } as const;
  }

  if (isMutation) {
    return { type: 'mutation', ...mutation } as const;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`Unsupported HTTP method: ${httpMethod}`);
  }
  // Return a default value to satisfy TypeScript, though this should never be reached
  return {} as any;
}
