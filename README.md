WarPath by Hi-5
====

Site public, accessible à tous les utilisateurs avec possibilité de s’inscrire pour créer son profil débloquant ainsi les fonctionnalités d’interactions.

Réalisation
------
- Wireframes : Robin
- Wireframes HD ([disponibles online](http://wireframes.wrpth.com)) : Wilson Ngaruye
- Maquettes : Virginie Riou
- Code : Joël Galeran

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
- Jade (Templating)
- Twitter Bootstrap 3 + Less
- Mongoose (ODM MongoDB)
- jQuery
- jQuery AutoComplete (Search)
- Mandrill (Emails)
- Mapbox
- YouTube API v3
- Vimeo API v3 avec module oAuth développé pour l'oAuth2 [https://github.com/ChibiJoel/passport-vimeo](https://github.com/ChibiJoel/passport-vimeo) (Il n'existait pas)
- [http://fitvidsjs.com/](http://fitvidsjs.com/) Player Video Responsive
- [http://sharrre.com/](http://sharrre.com/) Plugin jQuery pour le partage
- [http://www.sharedcount.com](http://www.sharedcount.com) API scraping pour les réseaux sociaux
- [http://stringjs.com/](http://stringjs.com/) Lib d'utilitaires pour strings
- [http://lodash.com/](http://lodash.com/) lib d'utilitaires
- [https://github.com/caolan/async](https://github.com/caolan/async) Async Utilities
- [https://linkedin.github.io/hopscotch/](https://linkedin.github.io/hopscotch/) hopscotch pour la visite guidée

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
- Version online : [http://www.wrpth.com](http://www.wrpth.com)
 ou [http://beta.wrpth.com](http://beta.wrpth.com)
