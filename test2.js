document.addEventListener("DOMContentLoaded", function () {
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");

    function populateVoices() {
        const voices = speechSynthesis.getVoices();

        voiceList.innerHTML = "";
        voices.forEach((voice, index) => {
            const voiceOption = document.createElement("div");
            voiceOption.textContent = `${voice.name} (${voice.lang})`;
            voiceOption.dataset.value = voice.name;
            voiceOption.classList.add("dropdown-item");

            voiceOption.addEventListener("click", function () {
                voiceBtn.textContent = this.textContent;
                voiceList.classList.remove("show");
            });

            voiceList.appendChild(voiceOption);

            // Встановлюємо перший голос як значення кнопки
            if (index === 0) {
                voiceBtn.textContent = `${voice.name} (${voice.lang})`;
            }
        });
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    } else {
        populateVoices();
    }

    voiceBtn.addEventListener("click", function () {
        voiceList.classList.toggle("show");
    });

    document.addEventListener("click", function (e) {
        if (!voiceBtn.contains(e.target) && !voiceList.contains(e.target)) {
            voiceList.classList.remove("show");
        }
    });
});
