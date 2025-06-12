import { parseQuery } from "./relay";

describe("parseQuery", () => {
  const defaultSearchableFields = ["title", "name", "description"];

  // ==================== BASIC TEXT QUERIES ====================

  describe("Basic Text Queries", () => {
    it("should parse simple text queries", () => {
      expect(parseQuery("apple")).toEqual({
        OR: [
          { title: { contains: "apple", mode: "insensitive" } },
          { name: { contains: "apple", mode: "insensitive" } },
          { description: { contains: "apple", mode: "insensitive" } },
        ],
      });
    });

    it("should parse multiple text queries", () => {
      expect(parseQuery("apple iphone")).toEqual({
        OR: [
          { title: { contains: "apple iphone", mode: "insensitive" } },
          { name: { contains: "apple iphone", mode: "insensitive" } },
          { description: { contains: "apple iphone", mode: "insensitive" } },
        ],
      });
    });

    it("should return empty object for empty query", () => {
      expect(parseQuery("")).toEqual({});
      expect(parseQuery("   ")).toEqual({});
      expect(parseQuery(undefined)).toEqual({});
    });

    it("should handle custom searchable fields", () => {
      expect(parseQuery("apple", ["product", "brand"])).toEqual({
        OR: [
          { product: { contains: "apple", mode: "insensitive" } },
          { brand: { contains: "apple", mode: "insensitive" } },
        ],
      });
    });
  });

  // ==================== FIELD:VALUE QUERIES ====================

  describe("Field:Value Queries", () => {
    it("should parse exact field matches", () => {
      expect(parseQuery("title:iphone")).toEqual({
        title: { equals: "iphone" },
      });
    });

    it("should parse quoted field values", () => {
      expect(parseQuery('title:"iPhone 15 Pro"')).toEqual({
        title: { equals: "iPhone 15 Pro" },
      });
    });

    it("should parse boolean values", () => {
      expect(parseQuery("active:true")).toEqual({
        active: { equals: true },
      });

      expect(parseQuery("featured:false")).toEqual({
        featured: { equals: false },
      });
    });

    it("should parse null values", () => {
      expect(parseQuery("deletedAt:null")).toEqual({
        deletedAt: { equals: null },
      });
    });

    it("should parse numeric values", () => {
      expect(parseQuery("price:999")).toEqual({
        price: { equals: 999 },
      });

      expect(parseQuery("rating:4.5")).toEqual({
        rating: { equals: 4.5 },
      });
    });
  });

  // ==================== OPERATOR QUERIES ====================

  describe("Operator Queries", () => {
    it("should parse comparison operators", () => {
      expect(parseQuery("price:>100")).toEqual({
        price: { gt: 100 },
      });

      expect(parseQuery("price:>=100")).toEqual({
        price: { gte: 100 },
      });

      expect(parseQuery("price:<500")).toEqual({
        price: { lt: 500 },
      });

      expect(parseQuery("price:<=500")).toEqual({
        price: { lte: 500 },
      });

      expect(parseQuery("status:!=active")).toEqual({
        status: { not: "active" },
      });
    });

    it("should parse wildcard operators", () => {
      expect(parseQuery("title:*phone*")).toEqual({
        title: { contains: "phone", mode: "insensitive" },
      });

      expect(parseQuery("title:*phone")).toEqual({
        title: { endsWith: "phone" },
      });

      expect(parseQuery("title:phone*")).toEqual({
        title: { startsWith: "phone" },
      });
    });

    it("should parse array operators", () => {
      expect(parseQuery("category:[phones,electronics]")).toEqual({
        category: { in: ["phones", "electronics"] },
      });

      expect(parseQuery("tags:[tech,mobile,apple]")).toEqual({
        tags: { in: ["tech", "mobile", "apple"] },
      });
    });
  });

  // ==================== COMPLEX QUERIES ====================

  describe("Complex Queries", () => {
    it("should parse AND queries", () => {
      expect(parseQuery("title:iphone AND status:active")).toEqual({
        AND: [
          { title: { equals: "iphone" } },
          { status: { equals: "active" } },
        ],
      });
    });

    it("should parse multiple AND queries", () => {
      expect(
        parseQuery("title:iphone AND status:active AND price:>500")
      ).toEqual({
        AND: [
          { title: { equals: "iphone" } },
          { status: { equals: "active" } },
          { price: { gt: 500 } },
        ],
      });
    });

    it("should parse mixed queries with text and fields", () => {
      const parsed = parseQuery("apple AND title:iphone");
      expect(parsed).toHaveProperty("AND");
      expect(parsed.AND).toEqual(
        expect.arrayContaining([
          {
            OR: [
              { title: { contains: "apple", mode: "insensitive" } },
              { name: { contains: "apple", mode: "insensitive" } },
              { description: { contains: "apple", mode: "insensitive" } },
            ],
          },
          { title: { equals: "iphone" } },
        ])
      );
    });

    it("should handle complex e-commerce queries", () => {
      expect(
        parseQuery(
          "category:electronics AND price:>=100 AND price:<=1000 AND brand:apple"
        )
      ).toEqual({
        AND: [
          { category: { equals: "electronics" } },
          { price: { gte: 100 } },
          { price: { lte: 1000 } },
          { brand: { equals: "apple" } },
        ],
      });
    });

    it("should handle inventory queries", () => {
      expect(
        parseQuery("stock:>0 AND status:active AND featured:true")
      ).toEqual({
        AND: [
          { stock: { gt: 0 } },
          { status: { equals: "active" } },
          { featured: { equals: true } },
        ],
      });
    });

    it("should handle search with filters", () => {
      expect(
        parseQuery(
          "title:*phone* AND category:[electronics,mobile] AND price:>200"
        )
      ).toEqual({
        AND: [
          { title: { contains: "phone", mode: "insensitive" } },
          { category: { in: ["electronics", "mobile"] } },
          { price: { gt: 200 } },
        ],
      });
    });
  });

  // ==================== CUSTOM OPERATORS ====================

  describe("Custom Operators", () => {
    it("should handle custom operators", () => {
      const customOperators = {
        "match:": "search",
        "similar:": "contains",
      };

      expect(
        parseQuery(
          "description:match:smartphone",
          defaultSearchableFields,
          customOperators
        )
      ).toEqual({
        description: { search: "smartphone" },
      });

      expect(
        parseQuery(
          "title:similar:phone",
          defaultSearchableFields,
          customOperators
        )
      ).toEqual({
        title: { contains: "phone" },
      });
    });

    it("should handle multiple custom operators", () => {
      const customOperators = {
        "fuzzy:": "search",
        "regex:": "regexp",
        "near:": "distance",
      };

      expect(
        parseQuery(
          "title:fuzzy:iphone AND location:near:london",
          defaultSearchableFields,
          customOperators
        )
      ).toEqual({
        AND: [
          { title: { search: "iphone" } },
          { location: { distance: "london" } },
        ],
      });
    });
  });

  // ==================== EDGE CASES ====================

  describe("Edge Cases", () => {
    it("should handle malformed queries gracefully", () => {
      expect(() => parseQuery("title:")).toThrow(
        "Malformed query part: title:"
      );
      expect(() => parseQuery(":value")).toThrow(
        "Malformed query part: :value"
      );
      expect(() => parseQuery("field:")).toThrow(
        "Malformed query part: field:"
      );
    });

    it("should handle special characters in values", () => {
      expect(parseQuery("email:user@example.com")).toEqual({
        email: { equals: "user@example.com" },
      });

      expect(parseQuery("url:https://example.com")).toEqual({
        url: { equals: "https://example.com" },
      });
    });

    it("should handle empty arrays", () => {
      expect(parseQuery("tags:[]")).toEqual({
        tags: { in: [""] },
      });
    });

    it("should handle single array values", () => {
      expect(parseQuery("category:[electronics]")).toEqual({
        category: { in: ["electronics"] },
      });
    });

    it("should handle spaces in array values", () => {
      expect(parseQuery("tags:[web design, mobile app, e-commerce]")).toEqual({
        tags: { in: ["web design", "mobile app", "e-commerce"] },
      });
    });

    it("should handle case sensitivity", () => {
      expect(parseQuery("title:iPhone AND status:ACTIVE")).toEqual({
        AND: [
          { title: { equals: "iPhone" } },
          { status: { equals: "ACTIVE" } },
        ],
      });
    });

    it("should handle mixed case operators", () => {
      expect(parseQuery("title:iphone and status:active")).toEqual({
        AND: [
          { title: { equals: "iphone" } },
          { status: { equals: "active" } },
        ],
      });
    });
  });

  // ==================== PERFORMANCE & REALISTIC SCENARIOS ====================

  describe("Realistic E-commerce Scenarios", () => {
    it("should handle product search with filters", () => {
      const query =
        "title:*MacBook* AND category:laptops AND price:>=1000 AND price:<=3000 AND brand:apple AND inStock:true";

      expect(parseQuery(query)).toEqual({
        AND: [
          { title: { contains: "MacBook", mode: "insensitive" } },
          { category: { equals: "laptops" } },
          { price: { gte: 1000 } },
          { price: { lte: 3000 } },
          { brand: { equals: "apple" } },
          { inStock: { equals: true } },
        ],
      });
    });

    it("should handle user search queries", () => {
      const query =
        "email:*@gmail.com AND status:active AND role:[admin,moderator] AND lastLogin:>2024-01-01";

      expect(parseQuery(query)).toMatchObject({
        AND: [
          { email: { endsWith: "@gmail.com" } },
          { status: { equals: "active" } },
          { role: { in: ["admin", "moderator"] } },
          { lastLogin: { gt: "2024-01-01" } },
        ],
      });
    });

    it("should handle order search queries", () => {
      const query =
        "status:pending AND total:>100 AND customerEmail:*@company.com AND createdAt:>=2024-01-01";

      expect(parseQuery(query)).toMatchObject({
        AND: [
          { status: { equals: "pending" } },
          { total: { gt: 100 } },
          { customerEmail: { endsWith: "@company.com" } },
          { createdAt: { gte: "2024-01-01" } },
        ],
      });
    });

    it("should handle content management queries", () => {
      const query =
        "title:*React* AND status:published AND tags:[javascript,frontend] AND author:!=system";

      expect(parseQuery(query)).toEqual({
        AND: [
          { title: { contains: "React", mode: "insensitive" } },
          { status: { equals: "published" } },
          { tags: { in: ["javascript", "frontend"] } },
          { author: { not: "system" } },
        ],
      });
    });

    it("should handle inventory management queries", () => {
      const query =
        "sku:*ELEC* AND quantity:<10 AND status:active AND supplier:[supplier1,supplier2]";

      expect(parseQuery(query)).toEqual({
        AND: [
          { sku: { contains: "ELEC", mode: "insensitive" } },
          { quantity: { lt: 10 } },
          { status: { equals: "active" } },
          { supplier: { in: ["supplier1", "supplier2"] } },
        ],
      });
    });
  });

  // ==================== SHOPIFY-STYLE QUERIES ====================

  describe("Shopify-Style Queries", () => {
    it("should handle Shopify product queries", () => {
      // title:iPhone AND product_type:Electronics AND vendor:Apple AND price:>500
      expect(
        parseQuery(
          "title:iPhone AND product_type:Electronics AND vendor:Apple AND price:>500"
        )
      ).toEqual({
        AND: [
          { title: { equals: "iPhone" } },
          { product_type: { equals: "Electronics" } },
          { vendor: { equals: "Apple" } },
          { price: { gt: 500 } },
        ],
      });
    });

    it("should handle Shopify customer queries", () => {
      // email:*@gmail.com AND accepts_marketing:true AND state:enabled
      expect(
        parseQuery(
          "email:*@gmail.com AND accepts_marketing:true AND state:enabled"
        )
      ).toEqual({
        AND: [
          { email: { endsWith: "@gmail.com" } },
          { accepts_marketing: { equals: true } },
          { state: { equals: "enabled" } },
        ],
      });
    });

    it("should handle Shopify order queries", () => {
      // financial_status:paid AND fulfillment_status:fulfilled AND total_price:>=100
      expect(
        parseQuery(
          "financial_status:paid AND fulfillment_status:fulfilled AND total_price:>=100"
        )
      ).toEqual({
        AND: [
          { financial_status: { equals: "paid" } },
          { fulfillment_status: { equals: "fulfilled" } },
          { total_price: { gte: 100 } },
        ],
      });
    });
  });

  // ==================== NEGATIVE CASES ====================

  describe("Negative Test Cases", () => {
    it("should handle queries with only operators", () => {
      expect(parseQuery("AND OR")).toEqual({
        OR: [
          { title: { contains: "AND OR", mode: "insensitive" } },
          { name: { contains: "AND OR", mode: "insensitive" } },
          { description: { contains: "AND OR", mode: "insensitive" } },
        ],
      });
    });

    it("should handle queries with excessive whitespace", () => {
      expect(parseQuery("  title:iphone   AND   status:active  ")).toEqual({
        AND: [
          { title: { equals: "iphone" } },
          { status: { equals: "active" } },
        ],
      });
    });

    it("should handle queries with invalid array syntax", () => {
      expect(parseQuery("tags:[unclosed")).toEqual({
        tags: { equals: "[unclosed" },
      });
    });

    it("should handle queries with invalid operator syntax", () => {
      expect(parseQuery("price:>>100")).toEqual({
        price: { gt: ">100" },
      });
    });

    it("should handle queries with special characters", () => {
      expect(parseQuery("description:*C++*")).toEqual({
        description: { contains: "C++", mode: "insensitive" },
      });
    });
  });

  // ==================== SINGLE CONDITION OPTIMIZATION ====================

  describe("Single Condition Optimization", () => {
    it("should return single condition without AND wrapper", () => {
      expect(parseQuery("title:iphone")).toEqual({
        title: { equals: "iphone" },
      });
    });

    it("should return single text search without AND wrapper", () => {
      expect(parseQuery("apple")).toEqual({
        OR: [
          { title: { contains: "apple", mode: "insensitive" } },
          { name: { contains: "apple", mode: "insensitive" } },
          { description: { contains: "apple", mode: "insensitive" } },
        ],
      });
    });

    it("should wrap multiple conditions in AND", () => {
      expect(parseQuery("title:iphone AND status:active")).toEqual({
        AND: [
          { title: { equals: "iphone" } },
          { status: { equals: "active" } },
        ],
      });
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe("Performance Tests", () => {
    it("should handle large queries efficiently", () => {
      const largeQuery = Array.from(
        { length: 50 },
        (_, i) => `field${i}:value${i}`
      ).join(" AND ");
      const result = parseQuery(largeQuery);

      expect(result.AND).toHaveLength(50);
      expect(result.AND[0]).toEqual({ field0: { equals: "value0" } });
      expect(result.AND[49]).toEqual({ field49: { equals: "value49" } });
    });

    it("should handle queries with many searchable fields", () => {
      const manyFields = Array.from({ length: 20 }, (_, i) => `field${i}`);
      const result = parseQuery("test", manyFields);

      expect(result.OR).toHaveLength(20);
      expect(result.OR[0]).toEqual({
        field0: { contains: "test", mode: "insensitive" },
      });
    });
  });
});
