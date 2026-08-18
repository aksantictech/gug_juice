# GUG Order — V2

Mini-site statique de commande GUG, prêt pour Vercel.

## Fonctionnalités
- Panier dynamique : 1 L, 500 ml et 250 ml.
- Présentation de la gamme : gingembre & fruits, curcuma, Energy Shots.
- Commande au minimum 3 jours à l'avance (contrôle automatique de la date).
- Livraison sans frais supplémentaires dès 20 € vers :
  - Bruxelles-Midi
  - Bruxelles-Central
  - Liedekerke
  - Station Denderleeuw
- Autres destinations : frais de transport à confirmer avant validation.
- Paiement : cash ou virement bancaire.
- Champ pour préciser les goûts / l'assortiment.
- Bloc de précautions avec confirmation obligatoire.
- Envoi final de la commande préremplie vers WhatsApp : 0470 923 114.

## Test local
Ouvrir le dossier dans PowerShell puis lancer :

python -m http.server 8080

Ensuite ouvrir http://localhost:8080

## Déploiement Vercel
1. Mettre le dossier sur GitHub.
2. Dans Vercel : Add New > Project.
3. Importer le dépôt.
4. Framework Preset : Other.
5. Aucune commande de build nécessaire.
6. Déployer.

Le site est 100 % statique : aucune base de données n'est nécessaire pour cette V2.
