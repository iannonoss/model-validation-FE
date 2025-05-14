# ModelValidationFE 📊🧠

Questo progetto è stato generato utilizzando [Angular CLI](https://github.com/angular/angular-cli) versione 19.2.1.

## 🚀 Introduzione

**ModelValidationFE** è l'interfaccia frontend per il sistema di validazione dei modelli (Model Validation System). È un'applicazione web sviluppata con Angular che permette agli utenti di:

* Caricare dataset
* Preprocessare i dati
* Addestrare modelli di Machine Learning
* Eseguire la cross-validation
* Visualizzare i risultati della classificazione e i decision boundary

Tutto questo attraverso un'interfaccia guidata e intuitiva. Questo frontend è progettato per funzionare in congiunzione con il [Model Validation Backend](https://github.com/iannonoss/model-validation-BE) (NB: Assicurati che il link al backend sia corretto o rimuovilo se non esiste).

## ✨ Funzionalità Principali

* **Upload e Anteprima Dataset**: Carica file CSV e visualizza il loro contenuto.
* **Suggerimenti Automatici**: Proposizione automatica di feature e variabile target (tramite Gemini 1.5).
* **Selezione Personalizzata**: Scelta manuale delle variabili indipendenti e della label.
* **Pipeline di Preprocessing**:
    * Gestione dei valori mancanti
    * Encoding delle variabili categoriche
    * Scaling delle feature
* **Addestramento e Predizione Modelli**:
    * Random Forest
    * Support Vector Machine (SVM)
    * XGBoost
    * Reti Neurali
* **Strategie di Cross-Validation**:
    * K-Fold
    * Stratified K-Fold
    * Leave-One-Out Cross-Validation (LOOCV)
* **Visualizzazioni Interattive**:
    * Metriche di performance
    * Plot 2D dei decision boundary (con o senza PCA)

## 🛠️ Tecnologie Utilizzate

* **Angular 19+**
* **Angular Material**: Per componenti UI responsive.
* **AG Grid**: Per tabelle dati veloci e flessibili.
* **RxJS**: Per programmazione reattiva e comunicazione asincrona.
* **Bootstrap 5**: Per lo styling.

## ⚙️ Installazione e Avvio

1.  **Clona il Repository:**
    ```bash
    git clone [https://github.com/iannonoss/model-validation-FE.git](https://github.com/iannonoss/model-validation-FE.git)
    cd model-validation-FE
    ```

2.  **Installa le Dipendenze:**
    ```bash
    npm install
    ```

3.  **Avvia il Development Server:**
    ```bash
    ng serve
    ```
    Una volta che il server è in esecuzione, apri il browser e naviga all'indirizzo `http://localhost:4200/`. L'applicazione si ricaricherà automaticamente ogni volta che modifichi uno dei file sorgente.

    ⚠️ **Importante:** Assicurati che il server backend sia in esecuzione all'indirizzo `http://localhost:8000/` (o aggiorna l'endpoint API di conseguenza nei file di servizio, solitamente in `src/app/services/` o `src/environments/environment.ts`).

## 📸 Screenshot

![image](https://github.com/user-attachments/assets/8eaa4876-ef1b-4ada-9cdf-e14a2c13c9fc)

## 📬 Contatti

Per domande o feedback, non esitare a contattarmi:

* 📧 **Email:** `https://www.linkedin.com/in/mattia-iannone7/`
* 👤 **Autore:** Mattia Iannone
* 🐙 **GitHub:** [iannonoss](https://github.com/iannonoss)

---

Questo progetto è stato generato utilizzando [Angular CLI](https://github.com/angular/angular-cli) versione 19.2.1.

### Server di Sviluppo (Comandi Angular CLI Standard)

Esegui `ng serve` per un server di sviluppo. Naviga su `http://localhost:4200/`. L'app si ricaricherà automaticamente se modifichi uno qualsiasi dei file sorgente.

### Generazione di Componenti

Esegui `ng generate component nome-componente` per generare un nuovo componente. Puoi anche usare `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Esegui `ng build` per costruire il progetto. Gli artefatti della build saranno memorizzati nella directory `dist/`.
