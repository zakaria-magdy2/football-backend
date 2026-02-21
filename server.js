// server.js
const http = require("http");

const API_TOKEN = "5311f7c911404d97950025a633e2452b"; // football-data.org
const BASE_URL = "https://api.football-data.org/v4";

const server = http.createServer(async (req, res) => {
  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    // ===============================
    // 🥅 هدافين الدوري الإسباني
    // ===============================
    if (req.url.startsWith("/laliga-topscorers")) {
      const response = await fetch(`${BASE_URL}/competitions/PD/scorers`, {
        headers: {
          "X-Auth-Token": API_TOKEN,
        },
      });

      const data = await response.json();

      const result = (data.scorers || []).map((s, i) => ({
        rank: i + 1,
        name: s.player.name,
        team: s.team.name,
        goals: s.goals,
        assists: s.assists ?? 0,
        penalties: s.penalties ?? 0,
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result));
    }

    // ===============================
    // 🛡️ أقوى + أضعف دفاع
    // ===============================
    if (req.url.startsWith("/laliga-defense")) {
      const response = await fetch(`${BASE_URL}/competitions/PD/standings`, {
        headers: {
          "X-Auth-Token": API_TOKEN,
        },
      });

      const data = await response.json();
      const teams = data.standings[0].table;

      const bestDefense = [...teams]
        .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
        .slice(0, 5)
        .map((t, i) => ({
          rank: i + 1,
          team: t.team.name,
          conceded: t.goalsAgainst,
        }));

      const worstDefense = [...teams]
        .sort((a, b) => b.goalsAgainst - a.goalsAgainst)
        .slice(0, 5)
        .map((t, i) => ({
          rank: i + 1,
          team: t.team.name,
          conceded: t.goalsAgainst,
        }));

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ bestDefense, worstDefense }));
    }

    // ===============================
    // ⚽ أقوى هجوم + أضعف هجوم
    // ===============================
    if (req.url.startsWith("/laliga-attack")) {
      const response = await fetch(`${BASE_URL}/competitions/PD/standings`, {
        headers: {
          "X-Auth-Token": API_TOKEN,
        },
      });

      const data = await response.json();
      const teams = data.standings[0].table;

      // ⚽ أقوى هجوم (أكتر أهداف)
      const bestAttack = [...teams]
        .sort((a, b) => b.goalsFor - a.goalsFor)
        .slice(0, 5)
        .map((t, i) => ({
          rank: i + 1,
          team: t.team.name,
          goals: t.goalsFor,
        }));

      // 🚨 أضعف هجوم (أقل أهداف)
      const worstAttack = [...teams]
        .sort((a, b) => a.goalsFor - b.goalsFor)
        .slice(0, 5)
        .map((t, i) => ({
          rank: i + 1,
          team: t.team.name,
          goals: t.goalsFor,
        }));

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ bestAttack, worstAttack }));
    }

    // ===============================
    // Default
    // ===============================
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Football-Data Server Running ✅");
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
