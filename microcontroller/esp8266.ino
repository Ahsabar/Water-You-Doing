#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define HEATER_PIN D5           // Still heater
#define PUMP_ENA_PIN D1         // Already assigned, keep
#define COOLER_EN_PIN D6        // Already assigned, keep

#define PUMP_IN1 D7             // Free pin (GPIO13)
#define PUMP_IN2 D8             // Free pin (GPIO15)

#define COOLER_IN3 D3           // GPIO0 – safe for output
#define COOLER_IN4 D4   
      // GPIO12
#define DHTPIN D2          // GPIO4 (correct GPIO for DHT11)
#define DHTTYPE DHT11
#define SOIL_MOISTURE_PIN A0

const char* ssid = "POCO X3 NFC";
const char* password = "b1rk2h3n";

WebSocketsClient webSocket;
DHT dht(DHTPIN, DHTTYPE);

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

                    if (command == "start_heater") {
                        digitalWrite(HEATER_PIN, HIGH);
                        Serial.println("Heater started");
                    } else if (command == "stop_heater") {
                        digitalWrite(HEATER_PIN, LOW); 
                        Serial.println("Heater stopped");
                    } else if (command == "start_cooler") {
                        digitalWrite(COOLER_IN3, HIGH);
                        digitalWrite(COOLER_IN4, LOW);
                        digitalWrite(COOLER_EN_PIN, HIGH);
                        Serial.println("Cooler started");
                    } else if (command == "stop_cooler") {
                        digitalWrite(COOLER_IN3, LOW);
                        digitalWrite(COOLER_IN4, LOW);
                        digitalWrite(COOLER_EN_PIN, LOW);
                        Serial.println("Cooler stopped");
                    } else if (command == "start_pump") {
                        digitalWrite(PUMP_IN1, HIGH);
                        digitalWrite(PUMP_IN2, LOW);
                        digitalWrite(PUMP_ENA_PIN, HIGH); // Pump ON
                        Serial.println("Pump started");
                    } else if (command == "stop_pump") {
                        digitalWrite(PUMP_IN1, LOW);
                        digitalWrite(PUMP_IN2, LOW);
                        digitalWrite(PUMP_ENA_PIN, LOW); 
                        Serial.println("Pump stopped");
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

    const int wetValue = 560;
    const int dryValue = 1024;

    if (rawValue < wetValue) rawValue = wetValue;
    if (rawValue > dryValue) rawValue = dryValue;

    int moisturePercent = map(rawValue, dryValue, wetValue, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    Serial.printf("Soil Moisture -> %d%%\n", moisturePercent);
    return moisturePercent;
}

void setup() {
    Serial.begin(115200);
    dht.begin();

    pinMode(HEATER_PIN, OUTPUT);
    digitalWrite(HEATER_PIN, LOW);

    pinMode(PUMP_IN1, OUTPUT);
    pinMode(PUMP_IN2, OUTPUT);
    pinMode(PUMP_ENA_PIN, OUTPUT);

    digitalWrite(PUMP_IN1, LOW);
    digitalWrite(PUMP_IN2, LOW);
    digitalWrite(PUMP_ENA_PIN, LOW);

    pinMode(COOLER_IN3, OUTPUT);
    pinMode(COOLER_IN4, OUTPUT);
    pinMode(COOLER_EN_PIN, OUTPUT);

    digitalWrite(COOLER_IN3, LOW);
    digitalWrite(COOLER_IN4, LOW);
    digitalWrite(COOLER_EN_PIN, LOW);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    webSocket.begin("192.168.74.73", 3000, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();

    static unsigned long lastTemperatureTime = 0;
    static unsigned long lastMoistureTime = 0;
    unsigned long currentTime = millis();

    if (currentTime - lastTemperatureTime > 10000) {
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

    if (currentTime - lastMoistureTime > 10000) {
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