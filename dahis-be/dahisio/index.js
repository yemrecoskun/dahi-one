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

    // Aktif değilse özel sayfa göster
    if (!dahiosData.isActive) {
      const characterId = dahiosData.characterId || "unknown";
      const characterName =
        characterId.charAt(0).toUpperCase() + characterId.slice(1);

      // Pasif tag için özel HTML sayfası
      const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>dahiOS Cihazı Pasif</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.8;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 700;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            opacity: 0.9;
        }
        .character-name {
            font-weight: 600;
            color: #ffd700;
        }
        .button {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 12px 24px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 32px;
            font-size: 12px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⏸️</div>
        <h1>Bu dahiOS Cihazı Şu Anda Pasif</h1>
        <p>
            <span class="character-name">${characterName}</span> karakterine
            ait dahiOS cihazı şu anda aktif değil.
        </p>
        <p>
            Cihazı aktif hale getirmek için lütfen cihaz sahibiyle iletişime
            geçin veya dahi's uygulamasından cihazı yönetin.
        </p>
        <a href="https://dahis.io" class="button">dahi's Ana Sayfaya Dön</a>
        <div class="footer">
            dahi's One © 2025
        </div>
    </div>
</body>
</html>
      `;

      return res.status(200).send(html);
    }

    // Yönlendirme URL'ini oluştur
    let redirectUrl;
    const profileLinkType = dahiosData.profileLinkType;
    const redirectType = dahiosData.redirectType || "character";
    const characterId = dahiosData.characterId;
    const customUrl = dahiosData.customUrl || "";

    // Önce profil link tipini kontrol et
    if (profileLinkType) {
      // Kullanıcının profil bilgilerini al
      const usersSnapshot = await db
        .collection("users")
        .where("devices", "array-contains", dahiosId)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        const profileValue = userData[profileLinkType] || "";

        if (profileValue) {
          switch (profileLinkType) {
            case "instagram":
              const instagramHandle = profileValue.replace(/^@?/, "");
              redirectUrl = `https://www.instagram.com/${instagramHandle}/`;
              break;
            case "whatsapp":
              const whatsappNumber = profileValue.replace(/\D/g, "");
              redirectUrl = `https://wa.me/${whatsappNumber}`;
              break;
            case "phone":
              const phoneNumber = profileValue.replace(/\D/g, "");
              redirectUrl = `tel:${phoneNumber}`;
              break;
            case "email":
              redirectUrl = `mailto:${profileValue}`;
              break;
            default:
              redirectUrl = `https://www.dahis.io/character/${characterId}`;
          }
        } else {
          // Profil değeri yoksa karakter sayfasına yönlendir
          redirectUrl = `https://www.dahis.io/character/${characterId}`;
        }
      } else {
        // Kullanıcı bulunamadıysa karakter sayfasına yönlendir
        redirectUrl = `https://www.dahis.io/character/${characterId}`;
      }
    } else {
      // Eski redirectType mantığı (geriye dönük uyumluluk)
      switch (redirectType) {
        case "character":
          redirectUrl = `https://www.dahis.io/character/${characterId}`;
          break;
        case "store":
          redirectUrl = `https://dahis.shop/one-${characterId}`;
          break;
        case "campaign":
          redirectUrl = customUrl || "https://www.dahis.io";
          break;
        case "instagram":
          const instagramHandle = customUrl.replace(/^@?/, "");
          redirectUrl = `https://www.instagram.com/${instagramHandle}/`;
          break;
        case "whatsapp":
          const whatsappNumber = customUrl.replace(/\D/g, "");
          redirectUrl = `https://wa.me/${whatsappNumber}`;
          break;
        case "phone":
          const phoneNumber = customUrl.replace(/\D/g, "");
          redirectUrl = `tel:${phoneNumber}`;
          break;
        case "email":
          redirectUrl = `mailto:${customUrl}`;
          break;
        default:
          redirectUrl = customUrl ||
            `https://www.dahis.io/character/${characterId}`;
      }
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

    const validRedirectTypes = [
      "character",
      "store",
      "campaign",
      "instagram",
      "whatsapp",
      "phone",
      "email",
    ];
    if (!redirectType || !validRedirectTypes.includes(redirectType)) {
      return res.status(400).json({
        status: "error",
        message:
          "redirectType must be one of: character, store, campaign, instagram, whatsapp, phone, email",
      });
    }

    const requiresCustomUrl = [
      "campaign",
      "instagram",
      "whatsapp",
      "phone",
      "email",
    ];
    if (requiresCustomUrl.includes(redirectType) && !customUrl) {
      return res.status(400).json({
        status: "error",
        message: `customUrl is required when redirectType is '${redirectType}'`,
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
      const validRedirectTypes = [
        "character",
        "store",
        "campaign",
        "instagram",
        "whatsapp",
        "phone",
        "email",
      ];
      if (!validRedirectTypes.includes(redirectType)) {
        return res.status(400).json({
          status: "error",
          message:
            "redirectType must be one of: character, store, campaign, instagram, whatsapp, phone, email",
        });
      }
      updateData.redirectType = redirectType;
    }

    // Custom URL gerektiren redirect type'ları kontrol et
    const requiresCustomUrl = [
      "campaign",
      "instagram",
      "whatsapp",
      "phone",
      "email",
    ];
    if (
      redirectType &&
      requiresCustomUrl.includes(redirectType) &&
      customUrl === undefined &&
      !tagData.customUrl
    ) {
      return res.status(400).json({
        status: "error",
        message:
          `customUrl is required when redirectType is '${redirectType}'`,
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

    if (req.body.profileLinkType !== undefined) {
      if (req.body.profileLinkType === null || req.body.profileLinkType === "") {
        // profileLinkType'i kaldır
        updateData.profileLinkType = admin.firestore.FieldValue.delete();
      } else {
        updateData.profileLinkType = req.body.profileLinkType;
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
