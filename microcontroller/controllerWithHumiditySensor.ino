#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // DHT11 support

#define HEIGHT_SENSOR_PIN 34  // Sharp IR sensor
#define DHTPIN 14             // DHT11 data pin
#define DHTTYPE DHT11         // DHT sensor type
#define SOIL_MOISTURE_PIN 35  // Soil moisture analog input

const char* ssid = "tplink";
const char* password = "asdfva124";

WebSocketsClient webSocket;
DHT dht(DHTPIN, DHTTYPE);  // Initialize DHT

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.println("[WSc] Connected to WebSocket server");
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
            {
                StaticJsonDocument<200> doc;
                DeserializationError error = deserializeJson(doc, payload, length);
                if (!error && doc.containsKey("command")) {
                    String command = doc["command"];
                    Serial.printf("Received command: %s\n", command.c_str());
                    // TODO: React to commands like "start_heater", etc.
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

int measureSoilMoisturePercent() {
    int rawValue = analogRead(SOIL_MOISTURE_PIN);
    Serial.printf("Soil Moisture -> Raw: %d\n", rawValue);

    // Calibration values — adjust based on your sensor and soil
    const int wetValue = 1500;   // ADC value for wet soil
    const int dryValue = 3600;   // ADC value for dry soil

    // Clamp raw value to calibration range
    if (rawValue < wetValue) rawValue = wetValue;
    if (rawValue > dryValue) rawValue = dryValue;

    // Map raw value to 0-100% moisture (wet = 100%, dry = 0%)
    int moisturePercent = map(rawValue, dryValue, wetValue, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    Serial.printf("Soil Moisture -> %d%%\n", moisturePercent);
    return moisturePercent;
}

void setup() {
    Serial.begin(115200);
    dht.begin();

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    webSocket.begin("192.168.0.152", 3000, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();

    static unsigned long lastHeightTime = 0;
    static unsigned long lastTemperatureTime = 0;
    static unsigned long lastMoistureTime = 0;

    unsigned long currentTime = millis();

    if (currentTime - lastHeightTime > 10000) {  // every 10s
        lastHeightTime = currentTime;
        float height = measureHeight();

        StaticJsonDocument<200> heightDoc;
        heightDoc["action"] = "updateSensor";
        heightDoc["sensorId"] = 4;
        heightDoc["sensorData"]["value"] = height;

        String heightMessage;
        serializeJson(heightDoc, heightMessage);
        sendData(heightMessage);
    }

    if (currentTime - lastTemperatureTime > 10000) {  // every 10s
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

    if (currentTime - lastMoistureTime > 5000) {  // every 5s
        lastMoistureTime = currentTime;
        int moisture = measureSoilMoisturePercent();

        StaticJsonDocument<200> moistDoc;
        moistDoc["action"] = "updateSensor";
        moistDoc["sensorId"] = 3;
        moistDoc["sensorData"]["value"] = moisture;

        String moistMessage;
        serializeJson(moistDoc, moistMessage);
        sendData(moistMessage);
    }
}
