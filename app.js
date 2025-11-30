// ================== DATE & TIME ==================
function updateDateTime() {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember",
    ];
    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const ss = now.getSeconds().toString().padStart(2, "0");
    document.getElementById(
        "datetime"
    ).textContent = `${dayName}, ${date} ${month} ${year} | ${hh}:${mm}:${ss} WIB`;
}
setInterval(updateDateTime, 1000);
updateDateTime();
// ================== SHA-256 ==================
async function sha256(msg) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
// ================== NAVIGATION ==================
function showPage(pageId) {
    document
        .querySelectorAll(".page")
        .forEach((p) => p.classList.remove("active"));
    document
        .querySelectorAll(".navbar button")
        .forEach((b) => b.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    document
        .getElementById("tab-" + pageId.split("-")[1])
        .classList.add("active");
}
// MODIFIED: Daftar tab
["home", "about", "hash", "block", "chain", "ecc", "consensus"].forEach((p) => {
    const t = document.getElementById("tab-" + p);
    if (t) t.onclick = () => showPage("page-" + p);
});

// Call to Action Button on Home Page
const startSimBtn = document.getElementById("start-simulation-btn");
if (startSimBtn) {
    startSimBtn.onclick = () => showPage('page-hash');
}

// Feature Cards on Home Page
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
        const pageId = card.getAttribute('data-page');
        if (pageId) showPage(pageId);
    });
});

// Accordion Logic on Home Page
const accordionBtns = document.querySelectorAll(".accordion-button");
accordionBtns.forEach(button => {
    button.addEventListener("click", () => {
        button.classList.toggle("active");
        const panel = button.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            panel.style.padding = "0 18px";
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
            panel.style.padding = "15px 18px";
        }
    });
});
// ================== HASH PAGE ==================
document.getElementById("hash-input").addEventListener("input", async (e) => {
    document.getElementById("hash-output").textContent = await sha256(
        e.target.value
    );
});
// ================== BLOCK PAGE ==================
const blockData = document.getElementById("block-data");
const blockNonce = document.getElementById("block-nonce");
const blockNumber = document.getElementById("block-number");
const blockHash = document.getElementById("block-hash");
const blockTimestamp = document.getElementById("block-timestamp");
const speedControl = document.getElementById("speed-control");
const mineButton = document.getElementById("btn-mine");
blockNonce.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    updateBlockHash();
});
blockData.addEventListener("input", updateBlockHash);
// allow changing block number to affect the hash
if (blockNumber) {
    blockNumber.addEventListener('input', (e) => {
        // sanitize to integer >= 0
        const v = parseInt(e.target.value);
        e.target.value = isNaN(v) || v < 0 ? 0 : v;
        updateBlockHash();
    });
}
async function updateBlockHash() {
    const data = blockData.value || "";
    const nonce = blockNonce.value || "0";
    const number = (blockNumber && blockNumber.value) ? blockNumber.value : "0";
    // short preview hash for the single-block UI (without timestamp)
    blockHash.textContent = await sha256(number + data + nonce);
}
mineButton.addEventListener("click", async () => {
    mineButton.disabled = true;
    mineButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Mining...</span>`;

    const data = blockData.value;
    const speedMultiplier = parseInt(speedControl.value) || 1;
    const baseBatch = 1000;
    const batchSize = baseBatch * speedMultiplier;
    const difficulty = "0000";
    const status = document.getElementById("mining-status");

    const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    blockTimestamp.value = timestamp;
    blockHash.textContent = "";
    blockNonce.value = "0";
    let nonce = 0;
    if (status) status.innerHTML = `<div class="loader"></div><span>Mencari nonce... (Kecepatan: ${speedMultiplier}x)</span>`;

    async function mineStep() {
        const promises = [];
        for (let i = 0; i < batchSize; i++) {
            const number = (blockNumber && blockNumber.value) ? blockNumber.value : "0";
            promises.push(sha256(number + data + timestamp + (nonce + i)));
        }
        const results = await Promise.all(promises);
        for (let i = 0; i < results.length; i++) {
            const h = results[i];
            if (h.startsWith(difficulty)) {
                blockNonce.value = nonce + i;
                blockHash.textContent = h;
                if (status)
                    status.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>Mining Selesai! Nonce ditemukan: <strong>${nonce + i}</strong></span>`;
                mineButton.disabled = false;
                mineButton.innerHTML = `<i class="fa-solid fa-play"></i><span>Mulai Mining</span>`;
                return;
            }
        }
        nonce += batchSize;
        blockNonce.value = nonce;
        if (status) status.innerHTML = `<div class="loader"></div><span>Mencari nonce... (Nonce: ${nonce})</span>`;
        setTimeout(mineStep, 0);
    }
    mineStep();
});
// ================== BLOCKCHAIN PAGE ==================
const ZERO_HASH = "0".repeat(64);
let blocks = [];
const chainDiv = document.getElementById("blockchain");

function renderChain() {
    chainDiv.innerHTML = ""; // Clear previous render
    const blockElements = [];

    blocks.forEach((blk, i) => {
        const blockEl = document.createElement("div");
        const cls = "blockchain-block" + (blk.invalid ? " invalid" : "");
        blockEl.className = cls;
        blockEl.id = `chain-block-${i}`;
        blockEl.innerHTML = `
            <h3><i class="fa-solid fa-cube"></i> Block #${blk.index}</h3>
            <label>Prev Hash:</label><div class="output hash-output">${blk.previousHash}</div>
            <label>Data:</label><textarea rows="2" onchange="onChainDataChange(${i}, this.value)">${blk.data}</textarea>
            <button onclick="mineChainBlock(${i})" class="mine"><i class="fa-solid fa-person-digging"></i> Mine</button>
            <div id="status-${i}" class="status"></div>
            <label>Timestamp:</label><div class="output" id="timestamp-${i}">${blk.timestamp}</div>
            <label>Nonce:</label><div class="output" id="nonce-${i}">${blk.nonce}</div>
            <label>Hash:</label><div class="output hash-output" id="hash-${i}">${blk.hash}</div>
        `;
        chainDiv.appendChild(blockEl);
        blockElements.push(blockEl);
    });

    // Add SVG connectors
    for (let i = 0; i < blockElements.length - 1; i++) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "chain-connector");
        // mark connector invalid if the following block is invalid
        if (blocks[i + 1] && blocks[i + 1].invalid) svg.classList.add('invalid');
        svg.innerHTML = `<line x1="0" y1="50%" x2="100%" y2="50%" />`;
        chainDiv.insertBefore(svg, blockElements[i + 1]);
    }
}
function addChainBlock() {
    const idx = blocks.length;
    const prev = idx ? blocks[idx - 1].hash : ZERO_HASH;
    const blk = {
        index: idx,
        data: "",
        previousHash: prev,
        timestamp: "",
        nonce: 0,
        hash: "",
        invalid: false,
    };
    blocks.push(blk);
    renderChain(); // Re-render the entire chain
    const newBlock = document.getElementById(`chain-block-${idx}`);
    if (newBlock) newBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
window.onChainDataChange = function (i, val) {
    blocks[i].data = val;
    blocks[i].nonce = 0;
    blocks[i].timestamp = "";
    blocks[i].hash = "";
    for (let j = i + 1; j < blocks.length; j++) {
        const prevBlock = blocks[j - 1];
        const currentBlock = blocks[j];
        currentBlock.previousHash = prevBlock.hash;
        currentBlock.nonce = 0;
        currentBlock.timestamp = "";
        currentBlock.hash = "";
    }
    // Re-render to update hashes and propagate changes. Do NOT mark invalid immediately.
    // Use onchange (blur) to trigger update, and verification should mark invalid when requested.
    renderChain();
};
window.mineChainBlock = function (i) {
    const blk = blocks[i];
    const prev = blk.previousHash;
    const data = blk.data;
    const difficulty = "0000";
    const batchSize = 1000 * 50;
    blk.nonce = 0;
    blk.timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    const t0 = performance.now();
    const status = document.getElementById(`status-${i}`);
    const ndiv = document.getElementById(`nonce-${i}`);
    const hdiv = document.getElementById(`hash-${i}`);
    const tdiv = document.getElementById(`timestamp-${i}`);
    status.innerHTML = `<div class="loader"></div><span>Mining...</span>`;
    async function step() {
        const promises = [];
        for (let j = 0; j < batchSize; j++)
            promises.push(sha256(prev + data + blk.timestamp + (blk.nonce + j)));
        const results = await Promise.all(promises);
        for (let j = 0; j < results.length; j++) {
            const h = results[j];
            if (h.startsWith(difficulty)) {
                blk.nonce += j;
                blk.hash = h;
                ndiv.textContent = blk.nonce;
                hdiv.textContent = h;
                tdiv.textContent = blk.timestamp;
                const dur = ((performance.now() - t0) / 1000).toFixed(3);
                status.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>Selesai! (${dur}s)</span>`;
                // clear invalid flag in data model and re-render
                if (blocks[i]) {
                    blocks[i].invalid = false;
                }
                renderChain();
                // Update subsequent blocks (propagate previousHash etc.)
                onChainDataChange(i, blk.data);
                return;
            }
        }
        blk.nonce += batchSize;
        ndiv.textContent = blk.nonce;
        setTimeout(step, 0);
    }
    step();
};
document.getElementById("btn-add-block").onclick = addChainBlock;
addChainBlock();
// ================== ECC DIGITAL SIGNATURE ==================
const ec = new elliptic.ec("secp256k1");
const eccPrivate = document.getElementById("ecc-private");
const eccPublic = document.getElementById("ecc-public");
const eccMessage = document.getElementById("ecc-message");
const eccSignature = document.getElementById("ecc-signature");
const eccVerifyResult = document.getElementById("ecc-verify-result");
function randomPrivateHex() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
function normHex(h) {
    if (!h) return "";
    return h.toLowerCase().replace(/^0x/, "");
}
document.getElementById("btn-generate-key").onclick = () => {
    const priv = randomPrivateHex();
    const key = ec.keyFromPrivate(priv, "hex");
    const pub =
        "04" +
        key.getPublic().getX().toString("hex").padStart(64, "0") +
        key.getPublic().getY().toString("hex").padStart(64, "0");
    eccPrivate.value = priv;
    eccPublic.value = pub;
    eccSignature.value = "";
    eccVerifyResult.textContent = "";
};
document.getElementById("btn-sign").onclick = async () => {
    const msg = eccMessage.value;
    if (!msg) {
        alert("Isi pesan!");
        return;
    }
    const priv = normHex(eccPrivate.value.trim());
    if (!priv) {
        alert("Private key kosong!");
        return;
    }
    const hash = await sha256(msg);
    const sig = ec
        .keyFromPrivate(priv, "hex")
        .sign(hash, { canonical: true })
        .toDER("hex");
    eccSignature.value = sig;
    eccVerifyResult.textContent = "";
};
document.getElementById("btn-verify").onclick = async () => {
    try {
        const msg = eccMessage.value,
            sig = normHex(eccSignature.value.trim()),
            pub = normHex(eccPublic.value.trim());
        if (!msg || !sig || !pub) {
            alert("Lengkapi semua field!");
            return;
        }
        const key = ec.keyFromPublic(pub, "hex");
        const valid = key.verify(await sha256(msg), sig);
        eccVerifyResult.textContent = valid
            ? "Signature VALID!"
            : "Signature TIDAK valid!";
    } catch (e) {
        eccVerifyResult.textContent = "Error verifikasi";
    }
};
// ================== KONSENSUS PAGE ==================
const ZERO = "0".repeat(64);
let balances = { A: 100, B: 100, C: 100 };
let txPool = [];
let chainsConsensus = { A: [], B: [], C: [] };
function updateBalancesDOM() {
    Object.keys(balances).forEach((u) => {
        const el = document.getElementById("saldo-" + u);
        if (el) {
            el.textContent = balances[u];
        }
    });
}
function parseTx(line) {
    const m = line.match(/^([A-C])\s*->\s*([A-C])\s*:\s*(\d+)$/);
    if (!m) return null;
    return { from: m[1], to: m[2], amt: parseInt(m[3]) };
}
// ======== Mining Helper ========
async function shaMine(prev, data, timestamp) {
    const diff = "000";
    const base = 1000;
    const batch = base * 50;
    return new Promise((resolve) => {
        let nonce = 0;
        async function loop() {
            const promises = [];
            for (let i = 0; i < batch; i++)
                promises.push(sha256(prev + data + timestamp + (nonce + i)));
            const results = await Promise.all(promises);
            for (let i = 0; i < results.length; i++) {
                const h = results[i];
                if (h.startsWith(diff)) {
                    resolve({ nonce: nonce + i, hash: h });
                    return;
                }
            }
            nonce += batch;
            setTimeout(loop, 0);
        }
        loop();
    });
}
// ======== Genesis dengan mining ========
async function createGenesisConsensus() {
    const diff = "000";
    const ts = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    for (let u of ["A", "B", "C"]) {
        let nonce = 0;
        let found = "";
        while (true) {
            const h = await sha256(ZERO + "Genesis" + ts + nonce);
            if (h.startsWith(diff)) {
                found = h;
                break;
            }
            nonce++;
        }
        chainsConsensus[u] = [
            {
                index: 0,
                prev: ZERO,
                data: "Genesis Block: 100 coins",
                timestamp: ts,
                nonce,
                hash: found,
                invalid: false,
            },
        ];
    }
    renderConsensusChains();
    updateBalancesDOM();
}
createGenesisConsensus();
// ======== Render Konsensus Chain ========
function renderConsensusChains() {
    ["A", "B", "C"].forEach((u) => {
        const cont = document.getElementById("chain-" + u);
        cont.innerHTML = "";
        const blockElements = [];

        chainsConsensus[u].forEach((blk, i) => {
            const d = document.createElement("div");
            d.className = "chain-block" + (blk.invalid ? " invalid" : "");
            d.id = `consensus-block-${u}-${i}`;
            d.innerHTML = `
                <div class="small"><strong>Blok #${blk.index}</strong></div>
                <div class="small">Prev:</div><input class="small" value="${blk.prev.substring(0, 10)}..." readonly>
                <div class="small">Data:</div><textarea class="data" rows="3">${blk.data}</textarea>
                <div class="small">Nonce:</div><input class="small" value="${blk.nonce}" readonly>
                <div class="small">Hash:</div><input class="small" value="${blk.hash.substring(0, 10)}..." readonly>`;

            const ta = d.querySelector("textarea.data");
            ta.addEventListener("input", (e) => {
                chainsConsensus[u][i].data = e.target.value;
                // Mark as invalid but don't re-render everything, just apply class
                for (let j = i; j < chainsConsensus[u].length; j++) {
                    document.getElementById(`consensus-block-${u}-${j}`).classList.add('invalid');
                    const connector = document.querySelector(`#consensus-block-${u}-${j} + .chain-connector`);
                    if (connector) connector.classList.add('invalid');
                }
            });
            cont.appendChild(d);
            blockElements.push(d);
        });

        // Add SVG connectors for consensus chains
        for (let i = 0; i < blockElements.length - 1; i++) {
            const svg = document.createElementNS("http://www.w3/2000/svg", "svg");
            svg.setAttribute("class", "chain-connector");
            cont.insertBefore(svg, blockElements[i + 1]);
        }
    });
}
// ======== Kirim Transaksi ========
["A", "B", "C"].forEach((u) => {
    const button = document.getElementById("send-" + u);
    button.onclick = () => {
        const fromWallet = button.closest('.wallet');
        const amt = parseInt(document.getElementById("amount-" + u).value);
        const to = document.getElementById("receiver-" + u).value;
        if (amt <= 0) {
            alert("Jumlah > 0");
            return;
        }
        if (balances[u] < amt) {
            alert("Saldo tidak cukup");
            return;
        }

        // --- Coin Animation ---
        const toWallet = document.querySelector(`.wallet[data-user="${to}"]`);
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.innerHTML = '<i class="fa-solid fa-circle-dollar-to-slot"></i>';
        fromWallet.appendChild(coin);

        const rectFrom = fromWallet.getBoundingClientRect();
        const rectTo = toWallet.getBoundingClientRect();

        // Calculate center positions
        const startX = rectFrom.left + rectFrom.width / 2;
        const startY = rectFrom.top + rectFrom.height / 2;
        const endX = rectTo.left + rectTo.width / 2;
        const endY = rectTo.top + rectTo.height / 2;

        document.documentElement.style.setProperty('--start-x', `${startX}px`);
        document.documentElement.style.setProperty('--start-y', `${startY}px`);
        document.documentElement.style.setProperty('--end-x', `${endX}px`);
        document.documentElement.style.setProperty('--end-y', `${endY}px`);

        coin.addEventListener('animationend', () => coin.remove());
        // --- End Animation ---

        const tx = `${u} -> ${to} : ${amt}`;
        txPool.push(tx);
        document.getElementById("mempool").value = txPool.join("\n");
    };
});
// ======== Mine Semua Transaksi ========
document.getElementById("btn-mine-all").onclick = async () => {
    if (txPool.length === 0) {
        alert("Tidak ada transaksi.");
        return;
    }
    const parsed = [];
    for (const t of txPool) {
        const tx = parseTx(t);
        if (!tx) {
            alert("Format salah: " + t);
            return;
        }
        parsed.push(tx);
    }
    const tmp = { ...balances };
    for (const tx of parsed) {
        if (tmp[tx.from] < tx.amt) {
            alert("Saldo " + tx.from + " tidak cukup.");
            return;
        }
        tmp[tx.from] -= tx.amt;
        tmp[tx.to] += tx.amt;
    }
    const ts = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const data = txPool.join(" | ");
    const mining = ["A", "B", "C"].map(async (u) => {
        const prev = chainsConsensus[u].at(-1).hash;
        const r = await shaMine(prev, data, ts);
        chainsConsensus[u].push({
            index: chainsConsensus[u].length,
            prev,
            data,
            timestamp: ts,
            nonce: r.nonce,
            hash: r.hash,
            invalid: false,
        });
    });
    await Promise.all(mining);
    balances = tmp;
    updateBalancesDOM();
    txPool = [];
    document.getElementById("mempool").value = "";
    renderConsensusChains();
    alert("Mining selesai (50 ×  lebih cepat).");
};
// ======== Tombol VERIFY Konsensus ========
document.getElementById("btn-verify-consensus").onclick = async () => {
    try {
        for (const u of ["A", "B", "C"]) {
            for (let i = 1; i < chainsConsensus[u].length; i++) {
                const blk = chainsConsensus[u][i];
                const expectedPrev = i === 0 ? ZERO : chainsConsensus[u][i - 1].hash;
                const recomputed = await sha256(
                    blk.prev + blk.data + blk.timestamp + blk.nonce
                );
                blk.invalid = recomputed !== blk.hash || blk.prev !== expectedPrev;
            }
        }
        renderConsensusChains();
        alert("Verifikasi selesai  —  blok yang berubah ditandai merah.");
    } catch (err) {
        console.error("Error saat verifikasi Konsensus:", err);
        alert("Terjadi kesalahan saat verifikasi Konsensus. Cek console.");
    }
};
// ======== Tombol CONSENSUS ========
document.getElementById("btn-consensus").onclick = async () => {
    try {
        const maxLen = Math.max(
            chainsConsensus.A.length,
            chainsConsensus.B.length,
            chainsConsensus.C.length
        );
        for (let i = 0; i < maxLen; i++) {
            const vals = [];
            for (const u of ["A", "B", "C"])
                if (chainsConsensus[u][i]) vals.push(chainsConsensus[u][i].data);
            if (vals.length === 0) continue;
            const freq = {};
            let maj = vals[0];
            let maxc = 0;
            vals.forEach((v) => {
                freq[v] = (freq[v] || 0) + 1;
                if (freq[v] > maxc) {
                    maxc = freq[v];
                    maj = v;
                }
            });
            for (const u of ["A", "B", "C"]) {
                if (!chainsConsensus[u][i]) continue;
                const blk = chainsConsensus[u][i];
                blk.data = maj;
                blk.prev = i === 0 ? ZERO : chainsConsensus[u][i - 1].hash;
                blk.hash = await sha256(
                    blk.prev + blk.data + blk.timestamp + blk.nonce
                );
                blk.invalid = false;
            }
        }
        renderConsensusChains();
        alert("Konsensus selesai, semua blok diseragamkan.");
    } catch (e) {
        console.error(e);
        alert("Error konsensus.");
    }
};

// ================== SCROLL ANIMATION ==================
document.addEventListener("DOMContentLoaded", () => {
    const scrollElements = document.querySelectorAll(".scroll-animate");

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        // Also check that the element is not hidden by display:none
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend &&
            el.offsetParent !== null
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add("is-visible");
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    };

    // Run animation on scroll
    window.addEventListener("scroll", handleScrollAnimation);

    // Run animation on initial load for elements already in view
    handleScrollAnimation();
});

// ================== ADVANCED VISUAL EFFECTS ==================
document.addEventListener("DOMContentLoaded", () => {
    // --- Interactive Cursor Glow ---
    const glow = document.getElementById('cursor-glow');
    if (glow) {
        window.addEventListener('mousemove', (e) => {
            // We use clientX/Y for viewport coordinates
            const { clientX, clientY } = e;
            glow.style.left = `${clientX}px`;
            glow.style.top = `${clientY}px`;
        });
    }

    // --- 3D Tilt Effect on Cards ---
    const tiltElements = document.querySelectorAll('.education-history, .skills-section, .contact-form, .map-container');
    tiltElements.forEach(el => {
        const height = el.clientHeight;
        const width = el.clientWidth;

        el.addEventListener('mousemove', (e) => {
            const { layerX, layerY } = e;
            const yRotation = ((layerX - width / 2) / width) * 15; // Max 15deg rotation
            const xRotation = -((layerY - height / 2) / height) * 15;
            
            const string = `
                perspective(500px)
                scale(1.03)
                rotateX(${xRotation}deg)
                rotateY(${yRotation}deg)`;
            el.style.transform = string;
        });

        el.addEventListener('mouseout', () => {
            el.style.transform = 'perspective(500px) scale(1) rotateX(0) rotateY(0)';
        });
    });
});

// ================== CONTACT FORM HANDLER ==================
document.getElementById('btn-send-message').addEventListener('click', async () => {
    const nama = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const pesan = document.getElementById('contact-message').value.trim();

    if (!nama || !email || !pesan) {
        alert('Semua field harus diisi!');
        return;
    }

    const btn = document.getElementById('btn-send-message');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    try {
        // use explicit Vercel route for serverless function
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nama, email, pesan })
        });

        const result = await response.json();

        const statusEl = document.getElementById('contact-status');
        if (result.success) {
            if (statusEl) {
                statusEl.className = 'contact-status success';
                statusEl.textContent = '✅ Pesan berhasil dikirim. Terima kasih!';
            } else {
                alert('✅ Pesan berhasil dikirim ke email saya!');
            }
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-message').value = '';
        } else {
            if (statusEl) {
                statusEl.className = 'contact-status error';
                statusEl.textContent = '❌ Gagal mengirim: ' + (result.message || 'Unknown');
            } else {
                alert('❌ Gagal mengirim pesan: ' + result.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Kirim Pesan';
    }
});