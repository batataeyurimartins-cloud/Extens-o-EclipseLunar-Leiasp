// ==========================================
// AUTO QUIZ HUB - BATATA HUB V7 (WITH RESET)
// ==========================================

(function () {

    // Evita duplicar o menu na página
    if (document.getElementById("batataHub")) return;

    let interval = null;
    let timerInterval = null;
    let secondsElapsed = 0;
    let totalPoints = 0;

    // Criando o HUB Principal e a Tela Cheia Negra
    const hub = document.createElement("div");
    hub.id = "batataHub";

    hub.innerHTML = `
        <!-- INTERFACE DE CONFIGURACAO (MENU FLUTUANTE) -->
        <div id="hubMenu">
            <div id="hubHeader">🔮 BATATA HUB</div>

            <label>Delay (ms)</label>
            <input type="number" id="quizDelay" value="1000">

            <button id="startQuiz">INICIAR</button>
            <button id="stopQuiz">PARAR</button>
            <button id="resetQuiz">RESET</button>

            <div id="hubStatus">SYS_STATUS: STANDBY</div>
        </div>

        <!-- TELA PRETA SUPER PREMIUM (PÁGINA INTEIRA COM ANIMAÇÃO) -->
        <div id="hubFullScreenOverlay" style="display: none;">
            <div class="scanlines"></div>
            <div id="premiumContainer">
                <div class="glitchTitle" data-text="BATATA_HUB_LIGADO">BATATA_HUB_LIGADO</div>
                
                <div class="premiumStatsGrid">
                    <div class="premiumStatBox">
                        <span class="premiumLabel">// TIME_ELAPSED</span>
                        <span id="hudTimer" class="premiumValue">00:00</span>
                    </div>
                    <div class="premiumStatBox">
                        <span class="premiumLabel">// SCORE_COUNTER</span>
                        <span id="hudPoints" class="premiumValue">0</span>
                    </div>
                </div>

                <button id="stopPremiumBtn">ABORT_OPERATION</button>
                
                <!-- AVISO DE ALTA VELOCIDADE -->
                <div class="speedWarning">
                    ⚠️ [AVISO]: EM ALTA VELOCIDADE O CONTADOR DE PONTOS PODE BUGAR!! [AVISO] ⚠️
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(hub);

    // Injetando os Estilos CSS Roxo Tático com Animações
    const style = document.createElement("style");
    style.innerHTML = `
        /* Menu Flutuante Estilo Roxo Tático */
        #batataHub {
            position: fixed;
            top: 100px;
            right: 30px;
            width: 240px;
            background: #110f14;
            border: 1px solid #282136;
            border-radius: 8px;
            padding: 16px;
            z-index: 999999;
            color: #e1e1e6;
            font-family: 'Courier New', monospace;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(122, 0, 255, 0.1);
            box-sizing: border-box;
        }

        #hubHeader {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 16px;
            text-align: center;
            color: #a370f7;
            cursor: move;
            letter-spacing: 2px;
            border-bottom: 1px solid #282136;
            padding-bottom: 8px;
        }

        #batataHub label {
            display: block;
            margin-bottom: 6px;
            font-size: 11px;
            color: #7c728a;
            letter-spacing: 1px;
        }

        #quizDelay {
            width: 100%;
            padding: 10px;
            border: 1px solid #282136;
            border-radius: 4px;
            margin-bottom: 14px;
            background: #181521;
            color: #a370f7;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            box-sizing: border-box;
            text-align: center;
            outline: none;
        }

        #startQuiz {
            width: 100%;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid #a370f7;
            border-radius: 4px;
            background: transparent;
            color: #a370f7;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
            transition: all 0.2s ease;
        }

        #startQuiz:hover {
            background: #a370f7;
            color: #110f14;
            box-shadow: 0 0 15px rgba(122, 0, 255, 0.4);
            transform: scale(1.02);
        }

        #stopQuiz {
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            border: 1px solid #221d2b;
            border-radius: 4px;
            background: transparent;
            color: #625970;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        #stopQuiz:hover {
            border-color: #e1e1e6;
            color: #e1e1e6;
        }

        #resetQuiz {
            width: 100%;
            padding: 10px;
            border: 1px solid #ffaa00;
            border-radius: 4px;
            background: transparent;
            color: #ffaa00;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #resetQuiz:hover {
            background: #ffaa00;
            color: #110f14;
            box-shadow: 0 0 15px rgba(255, 170, 0, 0.3);
        }

        #hubStatus {
            margin-top: 14px;
            text-align: center;
            color: #625970;
            font-size: 10px;
            letter-spacing: 1px;
        }

        /* --------------------------------------
           TELA CHEIA TÁTICA ROXA (FULLSCREEN)
        ----------------------------------------- */
        #hubFullScreenOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #050408;
            z-index: 9999998;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
            animation: fadeInOverlay 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            overflow: hidden;
        }

        .scanlines {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, rgba(122, 0, 255, 0.03), rgba(0, 255, 0, 0.01), rgba(122, 0, 255, 0.03));
            background-size: 100% 4px, 6px 100%;
            z-index: 2;
            pointer-events: none;
        }

        #premiumContainer {
            text-align: center;
            max-width: 700px;
            width: 100%;
            padding: 20px;
            z-index: 3;
        }

        .glitchTitle {
            font-size: 24px;
            font-weight: bold;
            color: #e1e1e6;
            margin-bottom: 60px;
            letter-spacing: 4px;
            position: relative;
            animation: glitchEffect 3s infinite;
        }

        .premiumStatsGrid {
            display: flex;
            justify-content: space-around;
            margin-bottom: 50px;
            gap: 24px;
        }

        .premiumStatBox {
            background: #0d0b12;
            border-left: 3px solid #a370f7;
            border-radius: 4px;
            padding: 30px 20px;
            width: 45%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            transition: transform 0.2s ease;
        }

        .premiumLabel {
            display: block;
            font-size: 11px;
            color: #625970;
            letter-spacing: 2px;
            margin-bottom: 12px;
            font-weight: bold;
        }

        .premiumValue {
            display: block;
            font-size: 46px;
            font-weight: bold;
            color: #fff;
        }

        .pulseValue {
            animation: scorePulse 0.3s ease-out;
        }

        #stopPremiumBtn {
            background: transparent;
            border: 1px solid #ff3333;
            color: #ff3333;
            padding: 16px 44px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            letter-spacing: 2px;
            margin-bottom: 40px;
        }

        #stopPremiumBtn:hover {
            background: #ff3333;
            color: #050408;
            box-shadow: 0 0 20px rgba(255, 51, 51, 0.4);
            transform: scale(1.03);
        }

        /* TEXTO DE AVISO EMBAIXO DA TELA */
        .speedWarning {
            font-size: 11px;
            color: #5c4f73;
            letter-spacing: 1px;
            line-height: 1.6;
            max-width: 550px;
            margin: 0 auto;
            border-top: 1px dashed #282136;
            padding-top: 20px;
            animation: pulseWarning 2s infinite ease-in-out;
        }

        /* KEYFRAMES */
        @keyframes fadeInOverlay {
            from { opacity: 0; transform: scale(1.01); }
            to { opacity: 1; transform: scale(1); }
        }

        @keyframes scorePulse {
            0% { transform: scale(1); color: #a370f7; }
            50% { transform: scale(1.06); }
            100% { transform: scale(1); color: #fff; }
        }

        @keyframes pulseWarning {
            0% { color: #5c4f73; }
            50% { color: #8e24aa; }
            100% { color: #5c4f73; }
        }

        @keyframes glitchEffect {
            0% { opacity: 1; }
            5% { opacity: 0.7; transform: skewX(4deg); }
            6% { opacity: 1; transform: skewX(0deg); }
            60% { opacity: 1; }
            65% { opacity: 0.8; transform: skewX(-2deg); }
            66% { opacity: 1; transform: skewX(0deg); }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Converte segundos para MM:SS
    function formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const minsStr = mins < 10 ? "0" + mins : mins;
        const secsStr = secs < 10 ? "0" + secs : secs;
        return minsStr + ":" + secsStr;
    }

    // Dispara animação de pulso
    function triggerPulseAnimation(element) {
        if (!element) return;
        element.classList.remove("pulseValue");
        void element.offsetWidth; // force reflow
        element.classList.add("pulseValue");
    }

    // ATIVAR
    function ativarBot() {
        const delayInput = document.getElementById("quizDelay");
        const delay = parseInt(delayInput.value) || 1000;

        if (interval) clearInterval(interval);
        if (timerInterval) clearInterval(timerInterval);

        document.getElementById("hubFullScreenOverlay").style.display = "flex";
        document.getElementById("hubStatus").innerText = "SYS_STATUS: ACTIVE";
        document.getElementById("hubMenu").style.display = "none";

        // Loop estável (150 pontos por clique)
        interval = setInterval(function () {
            const btn = document.querySelector("#btnAnswer");

            if (btn) {
                btn.dispatchEvent(new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                totalPoints += 150;
                const pointsDisplay = document.getElementById("hudPoints");
                if (pointsDisplay) {
                    pointsDisplay.innerText = totalPoints;
                    triggerPulseAnimation(pointsDisplay);
                }
                console.log("Quiz clicado");
            }
        }, delay);

        // Cronômetro (1s)
        timerInterval = setInterval(function () {
            secondsElapsed++;
            const timerDisplay = document.getElementById("hudTimer");
            if (timerDisplay) {
                timerDisplay.innerText = formatTime(secondsElapsed);
                triggerPulseAnimation(timerDisplay);
            }
        }, 1000);
    }

    // PARAR
    function pararBot() {
        if (interval) { clearInterval(interval); interval = null; }
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

        document.getElementById("hubFullScreenOverlay").style.display = "none";
        document.getElementById("hubMenu").style.display = "block";
        document.getElementById("hubStatus").innerText = "SYS_STATUS: HALTED";
    }

    // REINICIAR TUDO (ZERA VARIÁVEIS E INTERFACE)
    function reiniciarTudo() {
        pararBot(); // Para qualquer execução ativa primeiro
        
        // Zera os dados internos
        secondsElapsed = 0;
        totalPoints = 0;

        // Reseta os textos exibidos na tela preta preventiva
        document.getElementById("hudTimer").innerText = "00:00";
        document.getElementById("hudPoints").innerText = "0";

        document.getElementById("hubStatus").innerText = "SYS_STATUS: RESETED";
    }

    // Eventos
    document.getElementById("startQuiz").onclick = ativarBot;
    document.getElementById("stopQuiz").onclick = pararBot;
    document.getElementById("stopPremiumBtn").onclick = pararBot;
    document.getElementById("resetQuiz").onclick = reiniciarTudo;

    // Draggable
    const header = document.getElementById("hubHeader");
    let isDragging = false;
    let offsetX, offsetY;

    header.onmousedown = function (e) {
        isDragging = true;
        offsetX = e.clientX - hub.getBoundingClientRect().left;
        offsetY = e.clientY - hub.getBoundingClientRect().top;
        document.addEventListener("mousemove", dragMove);
        document.addEventListener("mouseup", dragStop);
    };

    function dragMove(e) {
        if (!isDragging) return;
        hub.style.left = (e.clientX - offsetX) + "px";
        hub.style.top = (e.clientY - offsetY) + "px";
        hub.style.right = "auto";
    }

    function dragStop() {
        isDragging = false;
        document.removeEventListener("mousemove", dragMove);
        document.removeEventListener("mouseup", dragStop);
    }

})();
