// Example of valid TypeScript code with proper naming conventions

// Mapping object: camelCase keys -> snake_case values
const TB_USER_FIELDS = {
  userId: "user_id",
  sessionId: "session_id",
  createdAt: "created_at",
  userName: "user_name",
  emailAddress: "email_address",
};

// API request/response types use camelCase
interface UserEvent {
  userId: string;
  eventName: string;
  eventCount: number;
  lastEventTime: string;
}

// Function that transforms API data to Tinybird format
function transformToTinybirdFormat(apiData: UserEvent) {
  return {
    [TB_USER_FIELDS.userId]: apiData.userId,
    event_name: apiData.eventName,
    event_count: apiData.eventCount,
    last_event_time: apiData.lastEventTime,
  };
}

// API endpoint handler
export async function handleUserEvents(request: any) {
  const body = {
    userId: request.userId,
    sessionId: request.sessionId,
    eventName: request.eventName,
    timestamp: new Date().toISOString(),
  };

  // Process the event...
  return body;
}
