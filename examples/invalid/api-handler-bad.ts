// Example of INVALID TypeScript code with naming violations

// BAD: Keys should be camelCase, values should be snake_case
const TB_USER_FIELDS = {
  user_id: "user_id",        // ❌ Key not camelCase
  userId: "userId",           // ❌ Value not snake_case
  sessionId: "session",       // ❌ Incorrect mapping
};

// BAD: Using snake_case in API objects
interface UserEvent {
  user_id: string;            // ❌ Should be userId
  event_name: string;         // ❌ Should be eventName
  event_count: number;        // ❌ Should be eventCount
}

// BAD: Mixed naming in object literals
export async function handleUserEvents(request: any) {
  const body = {
    user_id: request.userId,  // ❌ Key should be camelCase
    session_id: request.sessionId,  // ❌ Key should be camelCase
    EventName: request.eventName,   // ❌ PascalCase not allowed
  };

  return body;
}
