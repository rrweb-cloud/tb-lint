import { describe, it, expect } from 'vitest';
import {
  isCamelCase,
  isSnakeCase,
  camelToSnake,
  snakeToCamel,
  validateMapping,
} from '../../src/utils/caseUtils';

describe('caseUtils', () => {
  describe('isCamelCase', () => {
    it('should return true for valid camelCase strings', () => {
      expect(isCamelCase('userId')).toBe(true);
      expect(isCamelCase('sessionId')).toBe(true);
      expect(isCamelCase('createdAt')).toBe(true);
      expect(isCamelCase('userName')).toBe(true);
      expect(isCamelCase('myVar')).toBe(true);
      expect(isCamelCase('abc')).toBe(true);
      expect(isCamelCase('a')).toBe(true);
      expect(isCamelCase('user123')).toBe(true);
    });

    it('should return false for non-camelCase strings', () => {
      expect(isCamelCase('user_id')).toBe(false); // snake_case
      expect(isCamelCase('UserId')).toBe(false); // PascalCase
      expect(isCamelCase('USER_ID')).toBe(false); // SCREAMING_SNAKE_CASE
      expect(isCamelCase('user-id')).toBe(false); // kebab-case
      expect(isCamelCase('user id')).toBe(false); // contains space
      expect(isCamelCase('1user')).toBe(false); // starts with number
      expect(isCamelCase('')).toBe(false); // empty string
      expect(isCamelCase('user$id')).toBe(false); // contains special char
    });
  });

  describe('isSnakeCase', () => {
    it('should return true for valid snake_case strings', () => {
      expect(isSnakeCase('user_id')).toBe(true);
      expect(isSnakeCase('session_id')).toBe(true);
      expect(isSnakeCase('created_at')).toBe(true);
      expect(isSnakeCase('user_name')).toBe(true);
      expect(isSnakeCase('my_var')).toBe(true);
      expect(isSnakeCase('abc')).toBe(true);
      expect(isSnakeCase('a')).toBe(true);
      expect(isSnakeCase('user_123')).toBe(true);
      expect(isSnakeCase('user123')).toBe(true);
    });

    it('should return false for non-snake_case strings', () => {
      expect(isSnakeCase('userId')).toBe(false); // camelCase
      expect(isSnakeCase('UserId')).toBe(false); // PascalCase
      expect(isSnakeCase('USER_ID')).toBe(false); // uppercase
      expect(isSnakeCase('user-id')).toBe(false); // kebab-case
      expect(isSnakeCase('user id')).toBe(false); // contains space
      expect(isSnakeCase('1user')).toBe(false); // starts with number
      expect(isSnakeCase('')).toBe(false); // empty string
      expect(isSnakeCase('user__id')).toBe(false); // consecutive underscores
      expect(isSnakeCase('user_id_')).toBe(false); // trailing underscore
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('userId')).toBe('user_id');
      expect(camelToSnake('sessionId')).toBe('session_id');
      expect(camelToSnake('createdAt')).toBe('created_at');
      expect(camelToSnake('userName')).toBe('user_name');
      expect(camelToSnake('myVariable')).toBe('my_variable');
    });

    it('should handle consecutive uppercase letters', () => {
      expect(camelToSnake('userID')).toBe('user_id');
      expect(camelToSnake('userIDToken')).toBe('user_id_token');
      expect(camelToSnake('HTTPResponse')).toBe('http_response');
      expect(camelToSnake('parseHTMLString')).toBe('parse_html_string');
    });

    it('should handle single word', () => {
      expect(camelToSnake('user')).toBe('user');
      expect(camelToSnake('id')).toBe('id');
    });

    it('should handle numbers', () => {
      expect(camelToSnake('user123Id')).toBe('user123_id');
      expect(camelToSnake('version2Update')).toBe('version2_update');
    });

    it('should handle empty string', () => {
      expect(camelToSnake('')).toBe('');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_id')).toBe('userId');
      expect(snakeToCamel('session_id')).toBe('sessionId');
      expect(snakeToCamel('created_at')).toBe('createdAt');
      expect(snakeToCamel('user_name')).toBe('userName');
      expect(snakeToCamel('my_variable')).toBe('myVariable');
    });

    it('should handle single word', () => {
      expect(snakeToCamel('user')).toBe('user');
      expect(snakeToCamel('id')).toBe('id');
    });

    it('should handle numbers', () => {
      expect(snakeToCamel('user_123_id')).toBe('user123Id');
      expect(snakeToCamel('version_2_update')).toBe('version2Update');
    });

    it('should handle empty string', () => {
      expect(snakeToCamel('')).toBe('');
    });
  });

  describe('validateMapping', () => {
    it('should return true for correct mappings', () => {
      expect(validateMapping('userId', 'user_id')).toBe(true);
      expect(validateMapping('sessionId', 'session_id')).toBe(true);
      expect(validateMapping('createdAt', 'created_at')).toBe(true);
      expect(validateMapping('userName', 'user_name')).toBe(true);
    });

    it('should return false for incorrect mappings', () => {
      expect(validateMapping('userId', 'userid')).toBe(false);
      expect(validateMapping('userId', 'user_identifier')).toBe(false);
      expect(validateMapping('sessionId', 'session')).toBe(false);
      expect(validateMapping('createdAt', 'created')).toBe(false);
    });

    it('should handle complex cases', () => {
      expect(validateMapping('userIDToken', 'user_id_token')).toBe(true);
      expect(validateMapping('HTTPResponse', 'http_response')).toBe(true);
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain consistency between camelToSnake and snakeToCamel', () => {
      const camelCases = [
        'userId',
        'sessionId',
        'createdAt',
        'userName',
        'myVariable',
        'user123Id',
      ];

      for (const camelCase of camelCases) {
        const snake = camelToSnake(camelCase);
        const backToCamel = snakeToCamel(snake);
        expect(backToCamel).toBe(camelCase);
      }
    });

    it('should maintain consistency for snake to camel to snake', () => {
      const snakeCases = [
        'user_id',
        'session_id',
        'created_at',
        'user_name',
        'my_variable',
      ];

      for (const snakeCase of snakeCases) {
        const camel = snakeToCamel(snakeCase);
        const backToSnake = camelToSnake(camel);
        expect(backToSnake).toBe(snakeCase);
      }
    });
  });
});
