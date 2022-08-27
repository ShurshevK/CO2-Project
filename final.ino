#include <WiFi.h>
#include <FirebaseESP32.h>

#define FIREBASE_HOST "https://dianaproject-187b3-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "llMtcjx1voDo9aXbAol2KSVKuvHEB1vhxVnYx8XX"

//WIFI
const char* ssid = "kunsthalle"; //WIFI SSID
const char* password = "";  //WIFI heslo

FirebaseData fbdo;

int valvePin = 5;
double emmiVal;
double PreviosVal;
int j =1;
double diff =0;
int delayTime;

void setup() {
  Serial.begin(9600);
  pinMode(valvePin, OUTPUT);
    // Wi-Fi spojenie
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  delay(100);

  Serial.print("#");
  Serial.print(WiFi.localIP());
  Serial.println(",");
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);  
}

void loop() {

  if (Firebase.getDouble(fbdo, "/emission-data/emission-count")) {

      if (fbdo.dataTypeEnum() == fb_esp_rtdb_data_type_double) {
      emmiVal = fbdo.to<double>()/1000;
      Serial.println(emmiVal);
      if(j ==1) {
        PreviosVal =  emmiVal;
        j = 2;
        }
      diff = emmiVal - PreviosVal;
      delayTime = diff*1000;
      if (diff>0.1) {
        digitalWrite(valvePin, HIGH);
        delay(delayTime);
        digitalWrite(valvePin, LOW);
        }
      else {
        digitalWrite(valvePin, LOW); 
        }
      PreviosVal =  emmiVal;
      delay(1000);
    }

  } else {
    Serial.println(fbdo.errorReason());
  }

}

