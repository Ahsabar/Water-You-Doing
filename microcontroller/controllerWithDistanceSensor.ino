#include <WiFi.h>
#include <WebSocketsClient.h>

#define TRIG_PIN 5  // GPIO5 for trig
#define ECHO_PIN 18 // GPIO18 for echo

const char* ssid = "tplink";
const char* password = "asdfva124";

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.println("[WSc] Connected to WebSocket server");
            break;

        case WStype_TEXT:
            Serial.printf("[WSc] Received: %s\n", payload);
            break;

        default:
            break;
    }
}

void sendData(String message) {
  if (webSocket.isConnected()) {
    webSocket.sendTXT(message);
    Serial.printf("[WSc] Sent: %s\n", message.c_str());
  } else {
    Serial.println("[WSc] Not connected, cannot send data.");
  }
}

#define HEIGHT_SENSOR_PIN 34  // Analog-capable GPIO (e.g., 34)

float measureHeight() {
    int rawValue = analogRead(HEIGHT_SENSOR_PIN);
    float voltage = rawValue * (3.3 / 4095.0);  // ESP32 ADC resolution
    float distance_cm = 27.86 / (voltage - 0.42);  // empirical formula

    // Optional: Clamp the output
    if (distance_cm > 80 || distance_cm < 10) {
        distance_cm = 0;  // out of range
    }

    Serial.printf("Raw: %d, Voltage: %.2fV, Height: %.2f cm\n", rawValue, voltage, distance_cm);
    return distance_cm;
}

void setup() {
    Serial.begin(115200);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");

    webSocket.begin("192.168.0.152", 3000, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();
    static unsigned long lastTime = 0;
    unsigned long currentTime = millis();

    if (currentTime - lastTime > 10000) {
        lastTime = currentTime;

        // Measure height and send
        float height = measureHeight();
        StaticJsonDocument<200> doc;
        doc["action"] = "updateSensor";
        doc["sensorId"] = 4;
        doc["sensorData"]["value"] = height;
        
        String message;
        serializeJson(doc, message);
        sendData(message);
    }
}