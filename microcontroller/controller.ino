#include <WiFi.h>
#include <WebSocketsClient.h>

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
            // Check if the received message confirms connection
            if (strstr((char*)payload, "Controller connected")) {
                Serial.println("Controller connected confirmed.");
            }
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

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");

    webSocket.begin("192.168.0.152", 3000, "/");  // Replace with your server IP and port
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();
    static unsigned long lastTime = 0;
    unsigned long currentTime = millis();

    if (currentTime - lastTime > 5000) {
        lastTime = currentTime;
        sendData("{\"action\":\"greet\", \"message\":\"Merhaba Sunucu!\"}");
  }
}