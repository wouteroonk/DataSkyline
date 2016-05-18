<img src="/../develop/img/dataskylinelogo.png?raw=true" alt="Dataskyline logo" width="20%" align="left"/>
<img src="/../develop/img/rebelliousllamaslogo.png?raw=true" alt="Rebellious Llamas logo" width="10%" align="right"/>
# Dataskyline CMS
Dataskyline CMS biedt een content management systeem voor de Dataskyline, waarmee eenvoudig weergaves aan de Dataskyline toegevoegd kunnen worden. Dataskyline CMS verzorgt ook een omgeving voor eindgebruikers, waarmee zij kunnen kiezen welke thema's er op het scherm verschijnen.

## Server - client structuur
<img src="/../develop/img/systemdiagram.png?raw=true" alt="Systeem diagram" width="50%" align="right"/>

1. Clients connecten met centrale NodeJS server via websockets
2. Elke client heeft een iFrame waarin de content wordt geladen, om de websocket connectie niet constant te hoeven verversen.
3. Touchscreen stuurt commando’s naar de server, bijv: “/change config3.json”
4. Server haalt (lokaal opgeslagen) config3.json op
5. Server stuurt de inhoud van json file naar alle clients, bijv:

    ```json
    {
        "leftscreen": "template_links.html",
        "midscreen": "template_mid.html",
        "rightscreen": "template_rechts.html",
        "ledscreen": "template_led.html",
    }
    ```

6. Clients weten zelf of ze links/midden/rechterscherm zijn door middel van ip adres
Clients laden nieuwe URL in iFrame.

## Data Skyline config panel
De Data Skyline heeft een erg simpele ingebouwde config panel om config files mee aan te passen.

1.	Verbind met het Data Skyline wifi netwerk
2.	Ga naar het ip adres van de server in je browser: 192.168.1.100:8080 (Werking cpanel is alleen getest in Chrome)
3.	De config panel laat alle beschikbare config files zien die op de server staan
4.	Middels dit config panel kun je de verschillende config files aanpassen, updaten, verwijderen, of een compleet nieuwe config file maken. Deze config files worden lokaal op de server opgeslagen.
5.	De URLs in de config files kunnen extern gehost zijn (beginnen met www.) óf lokaal op de server zijn opgeslagen (voer het lokale pad in) 
6.	Beschikbare config files kunnen in de touchapplicatie worden aangeroepen, zie hierbij ook de voorbeeldapplicatie “touch.html”

##Templates
Voor elk van de vier schermen is een template beschikbaar. Deze zijn te vinden onder: /client/templates/. Het wordt aangeraden deze templates te gebruiken, omdat een aantal basisdingen hierin al zijn opgenomen:

* Verbergen van de cursor op de pagina
* Juiste resoluties
  * LED scherm is 1080p
  * 3 grote schermen zijn ieder 4K
* Uitlijning vakjes linker- en rechterscherm
  * Deze kunnen nog iets strakker worden uitgelijnd indien gewenst (aanpassen .css bestanden)
  * Aangeraden wordt om de vakjes aan elke kant ~10px te vergroten, zodat je de rand niet meer ziet

## Huidige content
De huidige Data Skyline content is gemaakt door Heinze Havinga. De repo is te vinden op https://github.com/heinzehavinga/dataskyline. Omdat sommige widgets een server nodig hebben, draait op elke client een lokale XAMPP server.

## Server installatie

1. Installeer NodeJS: https://nodejs.org/en/
2. Installeer Websocket-node package: "npm install websocket"
3. Installeer Request package: "npm install request"
4. Installeer Forever package globaal: "npm install forever -g"
  (Forever restart de server automatisch als 'ie crasht :) )
5. Configureer:
  * localPathToConfigs (ws_server.js) (indien nodig)
  * Server IP (client.js in /client/ Èn /server/cpanel/)
  * Client IPs (getIP.js in /client/ Èn /server/cpanel/)
6. Start Node server: "forever -o out.log -e err.log start ws_server.js"
7. Start alle clients
8. ???
9. PROFIT!
