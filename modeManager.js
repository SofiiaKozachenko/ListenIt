class ModeManager {
    static setActiveMode(mode) {
        document.querySelectorAll(".button-style").forEach(btn => {
            btn.classList.remove("active-mode");
        });

        const activeButton = document.getElementById(mode);
        if (activeButton) {
            activeButton.classList.add("active-mode");
        }
    }

    static saveMode(mode) {
        settingManager.setSetting("mode", mode); 
    }

    static init() {
        const hoverModeBtn = document.getElementById("hoverModeBtn");
        const fullPageModeBtn = document.getElementById("fullPageMode");
        const selectedTextModeBtn = document.getElementById("selectedTextMode");

        hoverModeBtn.addEventListener("click", () => {
            ModeManager.saveMode("hoverModeBtn");
            alert(`Режим змінено на: ${getModeName("hoverModeBtn")}`);
            setTimeout(() => {
                window.location.href = "test2.html"; 
            }, 100);
        });

        fullPageModeBtn.addEventListener("click", () => {
            ModeManager.saveMode("fullPageMode");
            alert(`Режим змінено на: ${getModeName("fullPageMode")}`);
            setTimeout(() => {
                window.location.href = "test2.html";
            }, 100);
        });

        selectedTextModeBtn.addEventListener("click", () => {
            ModeManager.saveMode("selectedTextMode");
            alert(`Режим змінено на: ${getModeName("selectedTextMode")}`);
            setTimeout(() => {
                window.location.href = "test2.html";
            }, 100);
        });
    }
}

export default ModeManager;
