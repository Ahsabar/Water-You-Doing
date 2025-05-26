#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // DHT11 support

#define HEIGHT_SENSOR_PIN 34  // Analog pin for Sharp IR
#define DHTPIN 14             // DHT11 data pin
#define DHTTYPE DHT11         // Type of sensor

const char* ssid = "tplink";
const char* password = "asdfva124";

WebSocketsClient webSocket;
DHT dht(DHTPIN, DHTTYPE);  // Initialize DHT

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.println("[WSc] Connected to WebSocket server");

            // Identify as controller
            {
                StaticJsonDocument<100> doc;
                doc["action"] = "greet";
                doc["message"] = "controller";
                String greeting;
                serializeJson(doc, greeting);
                webSocket.sendTXT(greeting);
                Serial.println("[WSc] Sent greeting as controller");
            }
            break;

        case WStype_TEXT:
            Serial.printf("[WSc] Received: %s\n", payload);

            // Optional: parse incoming JSON commands from backend here
            {
                StaticJsonDocument<200> doc;
                DeserializationError error = deserializeJson(doc, payload, length);
                if (!error) {
                    if (doc.containsKey("command")) {
                        String command = doc["command"];
                        Serial.printf("Received command: %s\n", command.c_str());
                        // TODO: react to commands like "start_heater" or "start_cooler"
                    }
                }
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

float measureHeight() {
    int rawValue = analogRead(HEIGHT_SENSOR_PIN);
    float voltage = rawValue * (3.3 / 4095.0);  // ESP32 ADC
    float distance_cm = 27.86 / (voltage - 0.42);  // Empirical formula

    if (distance_cm > 80 || distance_cm < 10) {
        distance_cm = 0;  // out of range
    }

    Serial.printf("Height -> Raw: %d, Voltage: %.2fV, Height: %.2f cm\n", rawValue, voltage, distance_cm);
    return distance_cm;
}

float measureTemperature() {
    float temp = dht.readTemperature();
    if (isnan(temp)) {
        Serial.println("Failed to read from DHT sensor!");
        return 0;
    }
    Serial.printf("Temperature: %.2f°C\n", temp);
    return temp;
}

void setup() {
    Serial.begin(115200);
    dht.begin();

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
    static unsigned long lastHeightTime = 0;
    static unsigned long lastTemperatureTime = 0;
    unsigned long currentTime = millis();

    if (currentTime - lastHeightTime > 1000000) {
        lastHeightTime = currentTime;

        // 1. Send height measurement
        float height = measureHeight();
        StaticJsonDocument<200> heightDoc;
        heightDoc["action"] = "updateSensor";
        heightDoc["sensorId"] = 4;
        heightDoc["sensorData"]["value"] = height;

        String heightMessage;
        serializeJson(heightDoc, heightMessage);
        sendData(heightMessage);
    }

    if (currentTime - lastTemperatureTime > 2000) {
        lastTemperatureTime = currentTime;

        float temperature = measureTemperature();
        StaticJsonDocument<200> tempDoc;
        tempDoc["action"] = "updateSensor";
        tempDoc["sensorId"] = 1;
        tempDoc["sensorData"]["value"] = temperature;

        String tempMessage;
        serializeJson(tempDoc, tempMessage);
        sendData(tempMessage);
    }
}