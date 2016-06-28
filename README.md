<img src="http://wouteroonk.nl/git_img/dataskylinelogo.png?raw=true" alt="Dataskyline logo" width="20%" align="left"/>
<img src="http://wouteroonk.nl/git_img/rebelliousllamaslogo.png?raw=true" alt="Rebellious Llamas logo" width="10%" align="right"/>
# Dataskyline CMS
Dataskyline CMS biedt een content management systeem voor de Dataskyline, waarmee eenvoudig weergaves aan de Dataskyline toegevoegd kunnen worden. Dataskyline CMS verzorgt ook een omgeving voor eindgebruikers, waarmee zij kunnen kiezen welke thema's er op de schermen verschijnen.

## Data Skyline config panel
De Data Skyline heeft een simpele configuratie pagina waar alle schermen in aangepast kunnnen worden.

1.	Verbind met het Data Skyline wifi netwerk
2.	Ga naar het ip adres van de server in je browser: 192.168.1.100:8080 (Werking cpanel is alleen getest in Chrome)
3.	Middels dit config panel kun je de verschillende config files aanpassen, updaten, verwijderen, of een compleet nieuwe config file maken. Deze config files worden lokaal op de server opgeslagen.
4.  Op het touchscreen worden alle thema's getoond en deze kunnen worden aangeroepen om de schermen te wijzigen.

## Server installatie

1. Installeer NodeJS: https://nodejs.org/en/
2. Ga in de terminal naar de map waar de server in zit "/server"
3. Voer het commando "npm install" uit
4. Installeer Forever package globaal: "npm install forever -g"
   (Forever restart de server automatisch als 'ie crasht :) )
5. Zorg dat de client een ip adres heeft welke bekend is in het bestand "/server/config.json"
6. Start Node server: "forever -o out.log -e err.log start ws_server.js"
7. Start alle clients door een webserver op de client te draaien met de client bestanden "/client"
8. Ga op de client in Google Chrome naar de lokaal gehoste website.

Dataskyline
Laatst geupdated: 28 Juni 2016 19:22
