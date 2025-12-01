/**
 * Oxlint plugin for enforcing Tinybird naming conventions
 *
 * This plugin provides rules to enforce:
 * 1. camelCase for API/JSON keys
 * 2. snake_case for Tinybird columns
 * 3. Correct mapping between camelCase and snake_case
 */

import { isCamelCase, isSnakeCase, camelToSnake } from '../utils/caseUtils.js';

interface PluginMeta {
  name: string;
  version: string;
}

interface RuleMeta {
  type: 'problem' | 'suggestion' | 'layout';
  docs: {
    description: string;
    category: string;
    recommended: boolean;
  };
  fixable?: 'code' | 'whitespace';
  schema: any[];
  messages: Record<string, string>;
}

interface RuleContext {
  report: (options: {
    node: any;
    messageId: string;
    data?: Record<string, any>;
  }) => void;
}

interface NodeVisitor {
  [key: string]: (node: any) => void;
}

interface Rule {
  meta: RuleMeta;
  create: (context: RuleContext) => NodeVisitor;
}

// Rule 1: Enforce camelCase for JSON keys in object literals
const camelCaseJsonKeysRule: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce camelCase naming for JSON object keys in API code',
      category: 'Stylistic Issues',
      recommended: true,
    },
    messages: {
      notCamelCase: 'Object key "{{key}}" should be in camelCase. Expected: "{{expected}}"',
      invalidKey: 'Object key "{{key}}" contains invalid characters for camelCase',
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      ObjectExpression(node: any) {
        // Check each property in the object
        for (const property of node.properties) {
          if (property.type !== 'Property') continue;

          let keyName: string | null = null;

          // Get the key name (handle both identifier and string literal keys)
          if (property.key.type === 'Identifier') {
            keyName = property.key.name;
          } else if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
            keyName = property.key.value;
          }

          if (!keyName) continue;

          // Skip certain special keys that are commonly not camelCase
          const skipKeys = ['__typename', '__proto__', 'constructor'];
          if (skipKeys.includes(keyName)) continue;

          // Check if the key is camelCase
          if (!isCamelCase(keyName)) {
            // Try to suggest a camelCase version
            let expected = keyName;

            // If it's snake_case, convert it
            if (isSnakeCase(keyName)) {
              expected = keyName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
            } else if (keyName.includes('_')) {
              // Has underscores but not valid snake_case
              expected = keyName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
            } else if (/^[A-Z]/.test(keyName)) {
              // Starts with uppercase (PascalCase)
              expected = keyName.charAt(0).toLowerCase() + keyName.slice(1);
            }

            context.report({
              node: property.key,
              messageId: expected !== keyName ? 'notCamelCase' : 'invalidKey',
              data: {
                key: keyName,
                expected: expected,
              },
            });
          }
        }
      },
    };
  },
};

// Rule 2: Enforce camelCase -> snake_case mapping consistency
const camelSnakeMappingRule: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce correct mapping between camelCase keys and snake_case values',
      category: 'Stylistic Issues',
      recommended: true,
    },
    messages: {
      keyNotCamelCase: 'Mapping key "{{key}}" should be in camelCase',
      valueNotSnakeCase: 'Mapping value "{{value}}" should be in snake_case',
      incorrectMapping: 'Mapping incorrect: "{{key}}" should map to "{{expected}}", but got "{{actual}}"',
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      ObjectExpression(node: any) {
        // Heuristic: if all values are string literals, treat as a mapping object
        const allStringValues = node.properties.every(
          (prop: any) =>
            prop.type === 'Property' &&
            prop.value.type === 'Literal' &&
            typeof prop.value.value === 'string'
        );

        if (!allStringValues || node.properties.length === 0) {
          return;
        }

        // Check each property
        for (const property of node.properties) {
          if (property.type !== 'Property') continue;

          let keyName: string | null = null;
          let valueName: string | null = null;

          // Get key name
          if (property.key.type === 'Identifier') {
            keyName = property.key.name;
          } else if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
            keyName = property.key.value;
          }

          // Get value
          if (property.value.type === 'Literal' && typeof property.value.value === 'string') {
            valueName = property.value.value;
          }

          if (!keyName || !valueName) continue;

          // Validate the mapping
          // 1. Key must be camelCase
          if (!isCamelCase(keyName)) {
            context.report({
              node: property.key,
              messageId: 'keyNotCamelCase',
              data: { key: keyName },
            });
            continue;
          }

          // 2. Value must be snake_case
          if (!isSnakeCase(valueName)) {
            context.report({
              node: property.value,
              messageId: 'valueNotSnakeCase',
              data: { value: valueName },
            });
            continue;
          }

          // 3. Value must equal camelToSnake(key)
          const expectedSnake = camelToSnake(keyName);
          if (valueName !== expectedSnake) {
            context.report({
              node: property,
              messageId: 'incorrectMapping',
              data: {
                key: keyName,
                expected: expectedSnake,
                actual: valueName,
              },
            });
          }
        }
      },
    };
  },
};

// Plugin definition
export default {
  meta: {
    name: 'tinybird-case',
    version: '1.0.0',
  } as PluginMeta,
  rules: {
    'camel-case-json-keys': camelCaseJsonKeysRule,
    'camel-snake-mapping': camelSnakeMappingRule,
  },
};
