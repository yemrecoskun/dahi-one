const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {v4: uuidv4} = require("uuid");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

/**
 * dahiOS Tag Okutma - Karakter Yönlendirme
 * GET /dahiosRedirect?dahiosId={dahiosId}
 */
exports.dahiosRedirect = onRequest({cors: true}, async (req, res) => {
  try {
    // Backward compatibility
    const dahiosId = req.query.dahiosId || req.query.nfcId;

    if (!dahiosId) {
      return res.status(400).json({
        status: "error",
        message: "dahiOS ID is required",
      });
    }

    // Firestore'dan dahiOS tag bilgisini al
    const dahiosRef = db.collection("dahios_tags").doc(dahiosId);
    const dahiosDoc = await dahiosRef.get();

    if (!dahiosDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "dahiOS tag not found",
      });
    }

    const dahiosData = dahiosDoc.data();

    // Aktif değilse hata döndür
    if (!dahiosData.isActive) {
      return res.status(403).json({
        status: "error",
        message: "dahiOS tag is not active",
      });
    }

    // Yönlendirme URL'ini oluştur
    let redirectUrl;
    const redirectType = dahiosData.redirectType || "character";
    const characterId = dahiosData.characterId;

    switch (redirectType) {
      case "character":
        // Redirect to character modal on main page
        redirectUrl = `https://dahis.io/?character=${characterId}`;
        break;
      case "store":
        redirectUrl = `https://dahis.shop/one-${characterId}`;
        break;
      case "campaign":
        redirectUrl = dahiosData.customUrl || "https://dahis.io";
        break;
      default:
        redirectUrl = dahiosData.customUrl ||
          `https://dahis.io/character/${characterId}`;
    }

    // İstatistik kaydet
    await db.collection("dahios_scans").add({
      dahiosId: dahiosId,
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
    logger.error("dahiOS redirect error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * dahiOS Tag Bilgisi Getir
 * GET /dahiosInfo?dahiosId={dahiosId}
 */
exports.dahiosInfo = onRequest({cors: true}, async (req, res) => {
  try {
    // Backward compatibility
    const dahiosId = req.query.dahiosId || req.query.nfcId;

    if (!dahiosId) {
      return res.status(400).json({
        status: "error",
        message: "dahiOS ID is required",
      });
    }

    const dahiosRef = db.collection("dahios_tags").doc(dahiosId);
    const dahiosDoc = await dahiosRef.get();

    if (!dahiosDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "dahiOS tag not found",
      });
    }

    const dahiosData = dahiosDoc.data();

    return res.json({
      status: "success",
      data: {
        dahiosId: dahiosId,
        characterId: dahiosData.characterId,
        redirectType: dahiosData.redirectType,
        isActive: dahiosData.isActive,
        customUrl: dahiosData.customUrl || null,
      },
    });
  } catch (error) {
    logger.error("dahiOS info error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * dahiOS İstatistikleri Getir (Admin)
 * GET /dahiosStats?characterId={id}
 */
exports.dahiosStats = onRequest({cors: true}, async (req, res) => {
  try {
    const characterId = req.query.characterId;

    let query = db.collection("dahios_scans")
        .orderBy("timestamp", "desc");

    if (characterId) {
      query = query.where("characterId", "==", characterId);
    }

    const snapshot = await query.limit(100).get();
    const stats = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Timestamp'leri serialize et
      const stat = {
        id: doc.id,
        dahiosId: data.dahiosId || data.nfcId, // Backward compatibility
        characterId: data.characterId,
        redirectType: data.redirectType,
        redirectUrl: data.redirectUrl,
        ipAddress: data.ipAddress || data.ip,
        userAgent: data.userAgent,
      };

      // Timestamp'i düzgün formatla
      if (data.timestamp) {
        if (data.timestamp.toDate) {
          // Firestore Timestamp objesi
          stat.timestamp = {
            seconds: Math.floor(data.timestamp.toDate().getTime() / 1000),
            nanoseconds: 0,
          };
        } else if (data.timestamp.seconds) {
          // Zaten serialize edilmiş
          stat.timestamp = data.timestamp;
        } else {
          stat.timestamp = data.timestamp;
        }
      }

      stats.push(stat);
    });

    return res.json({
      status: "success",
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    logger.error("dahiOS stats error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * dahiOS Tag Listesi Getir
 * GET /dahiosList?characterId={id}
 */
exports.dahiosList = onRequest({cors: true}, async (req, res) => {
  try {
    const characterId = req.query.characterId;

    let query = db.collection("dahios_tags")
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
        dahiosId: tagData.dahiosId || tagData.nfcId, // Backward compatibility
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
    logger.error("dahiOS list error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * dahiOS Tag Oluştur (Admin) - UUID ile
 * POST /dahiosCreate
 * Body: { characterId, redirectType, customUrl?, isActive? }
 */
exports.dahiosCreate = onRequest({cors: true}, async (req, res) => {
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
    const dahiosId = uuidv4();

    // dahiOS tag verisi
    const dahiosData = {
      dahiosId: dahiosId,
      characterId: characterId,
      redirectType: redirectType,
      isActive: isActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // customUrl varsa ekle
    if (customUrl) {
      dahiosData.customUrl = customUrl;
    }

    // Firestore'a kaydet
    await db.collection("dahios_tags").doc(dahiosId).set(dahiosData);

    logger.info("dahiOS tag created:", {dahiosId, characterId});

    return res.status(201).json({
      status: "success",
      message: "dahiOS tag created successfully",
      data: {
        dahiosId: dahiosId,
        characterId: characterId,
        redirectType: redirectType,
        isActive: isActive,
        customUrl: customUrl || null,
      },
    });
  } catch (error) {
    logger.error("dahiOS create error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * dahiOS Tag Güncelle (Admin)
 * PUT /dahiosUpdate
 * Body: { dahiosId, characterId?, redirectType?, customUrl?, isActive? }
 */
exports.dahiosUpdate = onRequest({cors: true}, async (req, res) => {
  try {
    // Sadece PUT isteklerini kabul et
    if (req.method !== "PUT") {
      return res.status(405).json({
        status: "error",
        message: "Method not allowed. Use PUT.",
      });
    }

    const {dahiosId, nfcId, characterId, redirectType, customUrl, isActive} =
      req.body;
    // Backward compatibility
    const tagId = dahiosId || nfcId;

    // Validasyon
    if (!tagId) {
      return res.status(400).json({
        status: "error",
        message: "dahiosId is required",
      });
    }

    // Tag'i kontrol et
    const tagDoc = await db.collection("dahios_tags").doc(tagId).get();

    if (!tagDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "dahiOS tag not found",
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

    if (redirectType === "campaign" && customUrl === undefined &&
        !tagData.customUrl) {
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
    await db.collection("dahios_tags").doc(tagId).update(updateData);

    logger.info("dahiOS tag updated:", {dahiosId: tagId, updateData});

    // Güncellenmiş veriyi getir
    const updatedDoc = await db.collection("dahios_tags").doc(tagId).get();
    const updatedData = updatedDoc.data();

    return res.json({
      status: "success",
      message: "dahiOS tag updated successfully",
      data: {
        dahiosId: updatedData.dahiosId ||
          updatedData.nfcId, // Backward compatibility
        characterId: updatedData.characterId,
        redirectType: updatedData.redirectType,
        isActive: updatedData.isActive,
        customUrl: updatedData.customUrl || null,
        updatedAt: updatedData.updatedAt,
      },
    });
  } catch (error) {
    logger.error("dahiOS update error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
