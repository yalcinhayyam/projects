// import { add, subtract, multiply, divide } from "./math";

const { add, subtract, multiply, divide } = require("./math");

describe("Math operations", () => {
  describe("add", () => {
    test("adds two positive numbers correctly", () => {
      expect(add(2, 3)).toBe(5);
    });

    test("adds negative numbers correctly", () => {
      expect(add(-1, -2)).toBe(-3);
    });

    test("adds zero correctly", () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe("subtract", () => {
    test("subtracts two positive numbers correctly", () => {
      expect(subtract(5, 3)).toBe(2);
    });

    test("subtracts negative numbers correctly", () => {
      expect(subtract(-2, -4)).toBe(2);
    });

    test("subtracts zero correctly", () => {
      expect(subtract(5, 0)).toBe(5);
    });
  });

  describe("multiply", () => {
    test("multiplies two positive numbers correctly", () => {
      expect(multiply(2, 3)).toBe(6);
    });

    test("multiplies by zero correctly", () => {
      expect(multiply(5, 0)).toBe(0);
    });

    test("multiplies negative numbers correctly", () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });

  describe("divide", () => {
    test("divides two positive numbers correctly", () => {
      expect(divide(6, 2)).toBe(3);
    });

    test("throws error when dividing by zero", () => {
      expect(() => divide(5, 0)).toThrow("Division by zero is not allowed");
    });

    test("divides negative numbers correctly", () => {
      expect(divide(-6, 2)).toBe(-3);
    });
  });
});
