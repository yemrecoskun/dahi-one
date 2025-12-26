const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {v4: uuidv4} = require("uuid");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

/**
 * NFC Tag Okutma - Karakter Yönlendirme
 * GET /nfcRedirect?nfcId={nfcId}
 */
exports.nfcRedirect = onRequest({cors: true}, async (req, res) => {
  try {
    const nfcId = req.query.nfcId;

    if (!nfcId) {
      return res.status(400).json({
        status: "error",
        message: "NFC ID is required",
      });
    }

    // Firestore'dan NFC tag bilgisini al
    const nfcRef = db.collection("nfc_tags").doc(nfcId);
    const nfcDoc = await nfcRef.get();

    if (!nfcDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "NFC tag not found",
      });
    }

    const nfcData = nfcDoc.data();

    // Aktif değilse hata döndür
    if (!nfcData.isActive) {
      return res.status(403).json({
        status: "error",
        message: "NFC tag is not active",
      });
    }

    // Yönlendirme URL'ini oluştur
    let redirectUrl;
    const redirectType = nfcData.redirectType || "character";
    const characterId = nfcData.characterId;

    switch (redirectType) {
      case "character":
        // Redirect to character modal on main page
        redirectUrl = `https://dahis.io/?character=${characterId}`;
        break;
      case "store":
        redirectUrl = `https://dahis.shop/one-${characterId}`;
        break;
      case "campaign":
        redirectUrl = nfcData.customUrl || "https://dahis.io";
        break;
      default:
        redirectUrl = nfcData.customUrl ||
          `https://dahis.io/character/${characterId}`;
    }

    // İstatistik kaydet
    await db.collection("nfc_scans").add({
      nfcId: nfcId,
      characterId: characterId,
      redirectType: redirectType,
      redirectUrl: redirectUrl,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Yönlendirme
    return res.redirect(302, redirectUrl);
  } catch (error) {
    logger.error("NFC redirect error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * NFC Tag Bilgisi Getir
 * GET /nfcInfo?nfcId={nfcId}
 */
exports.nfcInfo = onRequest({cors: true}, async (req, res) => {
  try {
    const nfcId = req.query.nfcId;

    if (!nfcId) {
      return res.status(400).json({
        status: "error",
        message: "NFC ID is required",
      });
    }

    const nfcRef = db.collection("nfc_tags").doc(nfcId);
    const nfcDoc = await nfcRef.get();

    if (!nfcDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "NFC tag not found",
      });
    }

    const nfcData = nfcDoc.data();

    return res.json({
      status: "success",
      data: {
        nfcId: nfcId,
        characterId: nfcData.characterId,
        redirectType: nfcData.redirectType,
        isActive: nfcData.isActive,
      },
    });
  } catch (error) {
    logger.error("NFC info error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * NFC İstatistikleri Getir (Admin)
 * GET /nfcStats?characterId={id}
 */
exports.nfcStats = onRequest({cors: true}, async (req, res) => {
  try {
    const characterId = req.query.characterId;

    let query = db.collection("nfc_scans")
        .orderBy("timestamp", "desc");

    if (characterId) {
      query = query.where("characterId", "==", characterId);
    }

    const snapshot = await query.limit(100).get();
    const stats = [];

    snapshot.forEach((doc) => {
      stats.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.json({
      status: "success",
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    logger.error("NFC stats error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * NFC Tag Listesi Getir
 * GET /nfcList?characterId={id}
 */
exports.nfcList = onRequest({cors: true}, async (req, res) => {
  try {
    const characterId = req.query.characterId;

    let query = db.collection("nfc_tags")
        .orderBy("createdAt", "desc");

    if (characterId) {
      query = query.where("characterId", "==", characterId);
    }

    const snapshot = await query.limit(100).get();
    const tags = [];

    snapshot.forEach((doc) => {
      const tagData = doc.data();
      tags.push({
        id: doc.id,
        nfcId: tagData.nfcId,
        characterId: tagData.characterId,
        redirectType: tagData.redirectType,
        isActive: tagData.isActive,
        customUrl: tagData.customUrl || null,
        createdAt: tagData.createdAt,
      });
    });

    return res.json({
      status: "success",
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    logger.error("NFC list error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * NFC Tag Oluştur (Admin) - UUID ile
 * POST /nfcCreate
 * Body: { characterId, redirectType, customUrl?, isActive? }
 */
exports.nfcCreate = onRequest({cors: true}, async (req, res) => {
  try {
    // Sadece POST isteklerini kabul et
    if (req.method !== "POST") {
      return res.status(405).json({
        status: "error",
        message: "Method not allowed. Use POST.",
      });
    }

    const {characterId, redirectType, customUrl, isActive = true} = req.body;

    // Validasyon
    if (!characterId) {
      return res.status(400).json({
        status: "error",
        message: "characterId is required",
      });
    }

    const validRedirectTypes = ["character", "store", "campaign"];
    if (!redirectType || !validRedirectTypes.includes(redirectType)) {
      return res.status(400).json({
        status: "error",
        message: "redirectType must be 'character', 'store', or 'campaign'",
      });
    }

    if (redirectType === "campaign" && !customUrl) {
      return res.status(400).json({
        status: "error",
        message: "customUrl is required when redirectType is 'campaign'",
      });
    }

    // UUID oluştur
    const nfcId = uuidv4();

    // NFC tag verisi
    const nfcData = {
      nfcId: nfcId,
      characterId: characterId,
      redirectType: redirectType,
      isActive: isActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // customUrl varsa ekle
    if (customUrl) {
      nfcData.customUrl = customUrl;
    }

    // Firestore'a kaydet
    await db.collection("nfc_tags").doc(nfcId).set(nfcData);

    logger.info("NFC tag created:", {nfcId, characterId});

    return res.status(201).json({
      status: "success",
      message: "NFC tag created successfully",
      data: {
        nfcId: nfcId,
        characterId: characterId,
        redirectType: redirectType,
        isActive: isActive,
        customUrl: customUrl || null,
      },
    });
  } catch (error) {
    logger.error("NFC create error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * NFC Tag Güncelle (Admin)
 * PUT /nfcUpdate
 * Body: { nfcId, characterId?, redirectType?, customUrl?, isActive? }
 */
exports.nfcUpdate = onRequest({cors: true}, async (req, res) => {
  try {
    // Sadece PUT isteklerini kabul et
    if (req.method !== "PUT") {
      return res.status(405).json({
        status: "error",
        message: "Method not allowed. Use PUT.",
      });
    }

    const {nfcId, characterId, redirectType, customUrl, isActive} = req.body;

    // Validasyon
    if (!nfcId) {
      return res.status(400).json({
        status: "error",
        message: "nfcId is required",
      });
    }

    // Tag'i kontrol et
    const tagDoc = await db.collection("nfc_tags").doc(nfcId).get();

    if (!tagDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "NFC tag not found",
      });
    }

    const tagData = tagDoc.data();
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Güncellenecek alanları kontrol et
    if (characterId !== undefined) {
      updateData.characterId = characterId;
    }

    if (redirectType !== undefined) {
      const validRedirectTypes = ["character", "store", "campaign"];
      if (!validRedirectTypes.includes(redirectType)) {
        return res.status(400).json({
          status: "error",
          message: "redirectType must be 'character', 'store', or 'campaign'",
        });
      }
      updateData.redirectType = redirectType;
    }

    if (redirectType === "campaign" && customUrl === undefined && !tagData.customUrl) {
      return res.status(400).json({
        status: "error",
        message: "customUrl is required when redirectType is 'campaign'",
      });
    }

    if (customUrl !== undefined) {
      if (customUrl === null || customUrl === "") {
        // customUrl'i kaldır
        updateData.customUrl = admin.firestore.FieldValue.delete();
      } else {
        updateData.customUrl = customUrl;
      }
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Firestore'da güncelle
    await db.collection("nfc_tags").doc(nfcId).update(updateData);

    logger.info("NFC tag updated:", {nfcId, updateData});

    // Güncellenmiş veriyi getir
    const updatedDoc = await db.collection("nfc_tags").doc(nfcId).get();
    const updatedData = updatedDoc.data();

    return res.json({
      status: "success",
      message: "NFC tag updated successfully",
      data: {
        nfcId: updatedData.nfcId,
        characterId: updatedData.characterId,
        redirectType: updatedData.redirectType,
        isActive: updatedData.isActive,
        customUrl: updatedData.customUrl || null,
        updatedAt: updatedData.updatedAt,
      },
    });
  } catch (error) {
    logger.error("NFC update error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
