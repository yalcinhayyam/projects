import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from "graphql-parse-resolve-info";
import { GraphQLResolveInfo, GraphQLOutputType } from "graphql";
import { Buffer } from "buffer";

// ==================== TYPE DEFINITIONS ====================

export type ConnectionArgs = {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
  query?: string;
  filters?: Record<string, any>;
  sortKey?: string;
  reverse?: boolean;
};

export type Edge<T> = {
  node: T;
  cursor: string;
};

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type Connection<T> = {
  edges: Edge<T>[];
  nodes: T[];
  pageInfo: PageInfo;
  totalCount?: number;
};

export type PrismaModel<T> = {
  findMany: (args: any) => Promise<T[]>;
  findUnique?: (args: any) => Promise<T | null>;
  count?: (args: any) => Promise<number>;
};

export type RelayPaginationOptions = {
  defaultFirst?: number;
  defaultLast?: number;
  maxLimit?: number;
  cursorField?: string;
  additionalSelect?: Record<string, any>;
  orderDirection?: "asc" | "desc";
  excludeFields?: string[];
  searchableFields?: string[];
  enableFullTextSearch?: boolean;
  customOperators?: Record<string, string>;
};

export type SingleQueryOptions = {
  excludeFields?: string[];
  fieldMap?: Record<string, string>;
  additionalSelect?: Record<string, any>;
};

export type QueryOperator =
  | "equals"
  | "not"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "mode"
  | "search";

// ==================== GRAPHQL FIELD PARSING ====================

function parseGraphQLResolveInfo(
  info: GraphQLResolveInfo,
  options: {
    excludeFields?: string[];
    fieldMap?: Record<string, string>;
    returnType?: GraphQLOutputType;
  } = {}
): Record<string, any> {
  const { excludeFields = ["__typename"], fieldMap = {}, returnType } = options;

  try {
    const parsedResolveInfo = parseResolveInfo(info, {
      deep: true,
      // nodes: returnType ? [returnType] : undefined,
    }) as ResolveTree;

    if (!parsedResolveInfo) {
      return {};
    }

    const simplifiedInfo = simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfo,
      info.returnType
    );

    return buildFieldTree(simplifiedInfo.fields, excludeFields, fieldMap);
  } catch (error) {
    console.warn("GraphQL field parsing failed, using fallback:", error);
    return {};
  }
}

function buildFieldTree(
  fields: Record<string, any>,
  excludeFields: string[],
  fieldMap: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [fieldName, field] of Object.entries(fields)) {
    if (excludeFields.includes(fieldName)) continue;

    const mappedName = fieldMap[fieldName] || fieldName;

    if (field.fields && Object.keys(field.fields).length > 0) {
      result[mappedName] = buildFieldTree(
        field.fields,
        excludeFields,
        fieldMap
      );
    } else {
      result[mappedName] = true;
    }
  }

  return result;
}

function convertToPrismaSelect(
  fieldTree: Record<string, any>
): Record<string, any> {
  const select: Record<string, any> = {};

  for (const [fieldName, fieldValue] of Object.entries(fieldTree)) {
    if (
      typeof fieldValue === "object" &&
      fieldValue !== null &&
      !Array.isArray(fieldValue)
    ) {
      const nestedSelect = convertToPrismaSelect(fieldValue);
      if (Object.keys(nestedSelect).length > 0) {
        select[fieldName] = { select: nestedSelect };
      }
    } else if (fieldValue === true) {
      select[fieldName] = true;
    }
  }

  return select;
}

// ==================== IMPROVED QUERY PARSING ====================

export function parseQuery(
  queryString: string | undefined,
  searchableFields: string[] = ["title", "name", "description"],
  customOperators: Record<string, string> = {}
): Record<string, any> {
  if (!queryString?.trim()) return {};

  // Split by AND/OR while preserving the operators
  const tokens = queryString.split(/\s+(AND|OR)\s+/i);
  
  if (tokens.length === 1) {
    // Single condition
    const condition = parseQueryPart(tokens[0].trim(), customOperators);
    if (condition) {
      return condition;
    }
    
    // Handle as text search across searchable fields
    if (searchableFields.length > 0) {
      const orConditions = searchableFields.map((field) => ({
        [field]: { contains: tokens[0].trim(), mode: "insensitive" },
      }));
      return { OR: orConditions };
    }
    
    return {};
  }

  // Parse multiple conditions with operators
  const conditions: any[] = [];
  const operators: string[] = [];
  
  // Extract conditions and operators
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      // This is a condition
      const part = tokens[i].trim();
      if (part) {
        const condition = parseQueryPart(part, customOperators);
        if (condition) {
          conditions.push(condition);
        } else {
          // Handle as text search
          if (searchableFields.length > 0) {
            const orConditions = searchableFields.map((field) => ({
              [field]: { contains: part, mode: "insensitive" },
            }));
            conditions.push({ OR: orConditions });
          }
        }
      }
    } else {
      // This is an operator
      operators.push(tokens[i].trim().toUpperCase());
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];

  // Build the final query based on operators
  // If we have mixed operators, we need to handle precedence
  // For now, let's handle simple cases: all AND or all OR
  const hasAnd = operators.some(op => op === 'AND');
  const hasOr = operators.some(op => op === 'OR');
  
  if (hasAnd && !hasOr) {
    // All AND - this should work correctly
    return { AND: conditions };
  } else if (hasOr && !hasAnd) {
    // All OR
    return { OR: conditions };
  } else if (hasAnd && hasOr) {
    // Mixed operators - handle left to right precedence
    return buildMixedQuery(conditions, operators);
  } else {
    // Fallback to AND
    return { AND: conditions };
  }
}

function buildMixedQuery(conditions: any[], operators: string[]): any {
  if (conditions.length <= 1) return conditions[0] || {};
  
  let result = conditions[0];
  
  for (let i = 0; i < operators.length; i++) {
    const operator = operators[i];
    const nextCondition = conditions[i + 1];
    
    if (operator === 'AND') {
      // Combine with AND
      if (result.AND) {
        result.AND.push(nextCondition);
      } else {
        result = { AND: [result, nextCondition] };
      }
    } else if (operator === 'OR') {
      // Combine with OR
      if (result.OR) {
        result.OR.push(nextCondition);
      } else {
        result = { OR: [result, nextCondition] };
      }
    }
  }
  
  return result;
}

// Alternative simpler approach (keeping for backward compatibility)
export function parseQuerySimple(
  queryString: string | undefined,
  searchableFields: string[] = ["title", "name", "description"],
  customOperators: Record<string, string> = {}
): Record<string, any> {
  if (!queryString?.trim()) return {};

  // Split by operators and track what operator to use
  const parts = queryString.split(/\s+(AND|OR)\s+/i);
  const conditions: any[] = [];
  let hasOrOperator = false;

  for (let i = 0; i < parts.length; i += 2) {
    const part = parts[i]?.trim();
    const operator = parts[i + 1]?.trim().toUpperCase();
    
    if (operator === 'OR') {
      hasOrOperator = true;
    }
    
    if (part) {
      const condition = parseQueryPart(part, customOperators);
      if (condition) {
        conditions.push(condition);
      } else {
        // Handle as text search
        if (searchableFields.length > 0) {
          const orConditions = searchableFields.map((field) => ({
            [field]: { contains: part, mode: "insensitive" },
          }));
          conditions.push({ OR: orConditions });
        }
      }
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  
  // Use OR if any OR operator was found, otherwise use AND
  return hasOrOperator ? { OR: conditions } : { AND: conditions };
}

function parseQueryPart(
  part: string,
  customOperators: Record<string, string> = {}
): any {
  if (!part?.trim()) return null;
  
  const trimmedPart = part.trim();
  
  // Handle quoted values: field:"quoted value"
  const quotedMatch = trimmedPart.match(/^(\w+):"([^"]*)"$/);
  if (quotedMatch) {
    const [, field, value] = quotedMatch;
    return { [field]: { equals: value } };
  }

  // Handle field:value pairs
  const colonIndex = trimmedPart.indexOf(":");
  if (colonIndex === -1) return null;

  const field = trimmedPart.slice(0, colonIndex).trim();
  const valueStr = trimmedPart.slice(colonIndex + 1).trim();

  if (!field || !valueStr) return null;

  // Handle arrays: field:[value1,value2]
  if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
    const values = valueStr
      .slice(1, -1)
      .split(",")
      .map((v) => v.trim())
      .filter(v => v.length > 0);
    
    if (values.length === 0) return null;
    return { [field]: { in: values } };
  }

  // Handle operators with better regex patterns
  const operators = [
    { pattern: /^>=(.+)$/, op: "gte" },
    { pattern: /^<=(.+)$/, op: "lte" },
    { pattern: /^>(.+)$/, op: "gt" },
    { pattern: /^<(.+)$/, op: "lt" },
    { pattern: /^!=(.+)$/, op: "not" },
    { pattern: /^\*(.+)\*$/, op: "contains" },
    { pattern: /^\*(.+)$/, op: "endsWith" },
    { pattern: /^(.+)\*$/, op: "startsWith" },
  ];

  for (const { pattern, op } of operators) {
    const match = valueStr.match(pattern);
    if (match) {
      const value = parseValue(match[1]);
      const condition: any = { [op]: value };
      
      // Add case insensitive mode for string operations
      if (["contains", "startsWith", "endsWith"].includes(op)) {
        condition.mode = "insensitive";
      }
      
      return { [field]: condition };
    }
  }

  // Custom operators
  for (const [customOp, prismaOp] of Object.entries(customOperators)) {
    if (valueStr.startsWith(customOp)) {
      const value = parseValue(valueStr.slice(customOp.length));
      return { [field]: { [prismaOp]: value } };
    }
  }

  // Default exact match
  const value = parseValue(valueStr);
  return { [field]: { equals: value } };
}

function parseValue(str: string): any {
  if (!str) return "";
  
  const trimmed = str.trim();

  // Boolean
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  // Null
  if (trimmed.toLowerCase() === "null") return null;

  // Number - be more careful with number parsing
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) return num;
  }

  // String
  return trimmed;
}

// ==================== SORTING ====================

function buildOrderBy(
  sortKey?: string,
  reverse?: boolean,
  defaultField: string = "createdAt",
  defaultDirection: "asc" | "desc" = "desc"
): Record<string, "asc" | "desc"> {
  if (!sortKey) {
    return { [defaultField]: defaultDirection };
  }

  // Handle nested sorting: user.name
  if (sortKey.includes(".")) {
    const parts = sortKey.split(".");
    let orderBy: any = {};
    let current = orderBy;

    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = reverse ? "asc" : "desc";
    return orderBy;
  }

  return { [sortKey]: reverse ? "asc" : "desc" };
}

// ==================== CURSOR UTILITIES ====================

const encodeCursor = (value: string | number): string => {
  return Buffer.from(`cursor:${String(value)}`).toString("base64");
};

const decodeCursor = (cursor: string): string => {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    if (!decoded.startsWith("cursor:")) {
      throw new Error("Invalid cursor format");
    }
    return decoded.slice(7);
  } catch (error) {
    throw new Error("Invalid cursor format");
  }
};

// ==================== DEBUG HELPER ====================

export function debugQuery(queryString: string, searchableFields?: string[]): void {
  console.log("=== QUERY DEBUG ===");
  console.log("Input:", queryString);
  
  const result = parseQuery(queryString, searchableFields);
  console.log("Parsed Result:", JSON.stringify(result, null, 2));
  
  // Test your specific case
  if (queryString === "title:*#4* AND id:fbdc14b3-ad69*") {
    console.log("\n=== EXPECTED FOR YOUR CASE ===");
    console.log("Should produce AND condition with:");
    console.log("1. title contains '#4' (case insensitive)");
    console.log("2. id starts with 'fbdc14b3-ad69'");
    console.log("\nActual structure:");
    
    const expected = {
      AND: [
        { title: { contains: "#4", mode: "insensitive" } },
        { id: { startsWith: "fbdc14b3-ad69", mode: "insensitive" } }
      ]
    };
    
    console.log("Expected:", JSON.stringify(expected, null, 2));
    console.log("Match:", JSON.stringify(result) === JSON.stringify(expected));
  }
}

// ==================== MAIN FUNCTIONS ====================

export async function getSingleWithProjection<T>(
  model: { findUnique: (args: any) => Promise<T | null> },
  info: GraphQLResolveInfo,
  where: Record<string, any>,
  options: SingleQueryOptions = {}
): Promise<T | null> {
  const {
    excludeFields = ["__typename"],
    fieldMap = {},
    additionalSelect = {},
  } = options;

  try {
    const fields = parseGraphQLResolveInfo(info, { excludeFields, fieldMap });
    const prismaSelect = convertToPrismaSelect(fields);

    // If no fields were selected, select all
    const finalSelect =
      Object.keys(prismaSelect).length > 0
        ? { ...prismaSelect, ...additionalSelect }
        : additionalSelect;

    return await model.findUnique({
      where,
      ...(Object.keys(finalSelect).length > 0 && { select: finalSelect }),
    });
  } catch (error) {
    console.warn("Projection failed, falling back to full query:", error);
    return await model.findUnique({ where });
  }
}

export async function relayConnectionWithProjection<T>(
  model: PrismaModel<T>,
  info: GraphQLResolveInfo,
  args: ConnectionArgs,
  baseWhere: any = {},
  options: RelayPaginationOptions = {}
): Promise<Connection<T>> {
  const {
    defaultFirst = 20,
    defaultLast = 20,
    maxLimit = 100,
    cursorField = "id",
    orderDirection = "desc",
    additionalSelect = {},
    excludeFields = ["__typename"],
    searchableFields = ["title", "name", "description"],
    enableFullTextSearch = false,
    customOperators = {},
  } = options;

  try {
    // Parse GraphQL fields
    const fields = parseGraphQLResolveInfo(info, {
      excludeFields: [...excludeFields, "pageInfo", "totalCount"],
    });

    // Handle Relay connection structure (edges.node)
    const nodeFields = fields.edges?.node || fields.nodes || fields;
    const prismaSelect = convertToPrismaSelect(nodeFields);

    // Build where clause with improved parsing
    const queryFilters = parseQuery(
      args.query,
      searchableFields,
      customOperators
    );
    const customFilters = args.filters || {};

    // Combine all conditions properly
    const allConditions = [baseWhere, queryFilters, customFilters].filter(
      (condition) => condition && Object.keys(condition).length > 0
    );

    let where: any = {};
    
    if (allConditions.length === 0) {
      where = {};
    } else if (allConditions.length === 1) {
      where = allConditions[0];
    } else {
      where = { AND: allConditions };
    }

    // Build order by
    const orderBy = buildOrderBy(
      args.sortKey,
      args.reverse,
      cursorField,
      orderDirection
    );

    // Pagination logic
    const isForwardPagination =
      args.first !== undefined || args.last === undefined;
    const limit = Math.min(
      args.first ??
        args.last ??
        (isForwardPagination ? defaultFirst : defaultLast),
      maxLimit
    );

    const cursor = isForwardPagination ? args.after : args.before;
    let cursorWhere = {};

    if (cursor) {
      try {
        const cursorValue = decodeCursor(cursor);
        const cursorCondition = isForwardPagination
          ? orderDirection === "desc"
            ? "lt"
            : "gt"
          : orderDirection === "desc"
          ? "gt"
          : "lt";

        cursorWhere = { [cursorField]: { [cursorCondition]: cursorValue } };
      } catch (error) {
        console.warn("Invalid cursor, ignoring:", error);
      }
    }

    const finalWhere =
      Object.keys(cursorWhere).length > 0
        ? { AND: [where, cursorWhere] }
        : where;

    // Debug logging - remove in production
    console.log("=== QUERY DEBUG INFO ===");
    console.log("Original query:", args.query);
    console.log("Parsed queryFilters:", JSON.stringify(queryFilters, null, 2));
    console.log("Final where clause:", JSON.stringify(finalWhere, null, 2));

    // Execute queries
    const [items, totalCount] = await Promise.all([
      model.findMany({
        where: finalWhere,
        take: isForwardPagination ? limit + 1 : -(limit + 1),
        orderBy,
        ...(Object.keys(prismaSelect).length > 0 && {
          select: { ...prismaSelect, [cursorField]: true, ...additionalSelect },
        }),
      }),
      model.count?.({
        where: Object.keys(where).length > 0 ? where : undefined,
      }) ?? Promise.resolve(0),
    ]);

    // Process results
    const hasExtra = items.length > limit;
    const nodes = hasExtra ? items.slice(0, limit) : items;

    if (!isForwardPagination) {
      nodes.reverse();
    }

    const edges: Edge<T>[] = nodes.map((node: any) => ({
      node,
      cursor: encodeCursor(node[cursorField]),
    }));

    return {
      edges,
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: isForwardPagination ? hasExtra : Boolean(args.before),
        hasPreviousPage: !isForwardPagination ? hasExtra : Boolean(args.after),
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
    };
  } catch (error: any) {
    console.error("Relay connection failed:", error);
    throw new Error(`Failed to execute relay connection: ${error.message}`);
  }
}

// ==================== HELPER FUNCTIONS ====================

export function createConnectionResolver<T>(
  model: PrismaModel<T>,
  defaultOptions: RelayPaginationOptions = {}
) {
  return async (
    parent: any,
    args: ConnectionArgs,
    context: any,
    info: GraphQLResolveInfo
  ): Promise<Connection<T>> => {
    const baseWhere =
      typeof defaultOptions.additionalSelect === "function"
        ? defaultOptions.additionalSelect(parent, context)
        : {};

    return relayConnectionWithProjection(
      model,
      info,
      args,
      baseWhere,
      defaultOptions
    );
  };
}

export function createSingleResolver<T>(
  model: { findUnique: (args: any) => Promise<T | null> },
  defaultOptions: SingleQueryOptions = {}
) {
  return async (
    parent: any,
    args: { where: Record<string, any> },
    context: any,
    info: GraphQLResolveInfo
  ): Promise<T | null> => {
    return getSingleWithProjection(model, info, args.where, defaultOptions);
  };
}

// ==================== USAGE EXAMPLES ====================

/*
// Basic Usage
const resolvers = {
  Query: {
    products: createConnectionResolver(prisma.product, {
      searchableFields: ['title', 'description', 'sku'],
      maxLimit: 50,
      defaultFirst: 20,
    }),
    
    product: createSingleResolver(prisma.product),
    
    // Advanced usage
    customProducts: async (_, args, context, info) => {
      return relayConnectionWithProjection(
        context.prisma.product,
        info,
        args,
        { 
          storeId: context.storeId,
          status: 'ACTIVE' 
        },
        {
          searchableFields: ['title', 'description', 'sku', 'tags'],
          customOperators: {
            'match:': 'search',
            'similar:': 'contains'
          },
          additionalSelect: {
            _count: {
              select: {
                reviews: true,
                variants: true
              }
            }
          }
        }
      );
    }
  }
};

// Query Examples:
// Basic: query:"iphone"
// Field search: query:"title:iphone AND status:active"
// Range: query:"price:>1000 AND price:<=2000"
// Array: query:"category:[phones,electronics]"
// Wildcard: query:"title:*phone*"
// Complex: query:"title:iphone AND (status:active OR featured:true)"

// Test your specific case:
debugQuery("title:*#4* AND id:fbdc14b3-ad69*");
*/