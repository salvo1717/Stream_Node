let partyMode = false;
document.addEventListener('DOMContentLoaded', function () {
    function toPartyMode() {
        if (partyMode) {
            function getRandomColor() {
                const lettere = '0123456789ABCDEF';
                let colore = '#';
                for (let i = 0; i < 6; i++) {
                    colore += lettere[Math.floor(Math.random() * 16)];
                }
                return colore;
            }
            const elementi = document.querySelectorAll('*');
            for (const elemento of elementi) {
                if (Math.random() < 0.3) {
                    elemento.style.backgroundColor = getRandomColor();
                    elemento.style.color = getRandomColor();
                }
            }
            partyMode = setTimeout(toPartyMode, 500);
        }
        else 
        {
            for (const elemento of document.querySelectorAll('*')) {
                elemento.style.backgroundColor = '';
                elemento.style.color = '';
            }
        }
    }
    document.getElementById("bparty").addEventListener("click", function () {
        partyMode = !partyMode;
        toPartyMode();
    });
});