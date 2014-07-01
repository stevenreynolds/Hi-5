WarPath by Hi-5
====

Site public, accessible à tous les utilisateurs avec possibilité de s’inscrire pour créer son profil débloquant ainsi les fonctionnalités d’interactions.

Fonctionnalités
------
- Commenter les vidéos en enregistrant le timestamp
- Importer  ses vidéos de Youtube et Vimeo et géolocaliser les vidéos
- Visualiser la map et les vidéos géolocalisées
- Envoyer un message à un membre
- Rechercher des Vidéos / Users
- Gagner des points (Gamification)
- Partager une vidéo
- oAuth Instagram / Google / Vimeo
- Login / Inscription / Reset Password Email
- Possibilité de lier plusieurs comptes Oauth

Installation
------
L'application se trouve dans le dossier /warpath

###Prérequis
- Node.js
- MongoDB

###Ressources Notables Utilisées
- Mongoose (ODM MongoDB)
- jQuery
- jQuery AutoComplete (Search)
- Less
- Mandrill (Emails)
- Mapbox
- YouTube API v3
- Vimeo API v3 avec module oAuth développé pour l'oAuth2 [https://github.com/ChibiJoel/passport-vimeo](https://github.com/ChibiJoel/passport-vimeo) (Il n'existait pas)

### Installation des dépendance via NPM
```
npm install
```
### Lancement de l'app
```
node app.js
```
### Il est temps d'ouvrir son naviguateur !
- Version locale : [http://localhost:3000](http://localhost:3000)
- Version online : [http://beta.wrpth.com](http://beta.wrpth.com)
