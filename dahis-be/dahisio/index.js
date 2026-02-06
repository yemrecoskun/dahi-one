const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {v4: uuidv4} = require("uuid");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

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

    // format=json query parameter'ı varsa JSON döndür (tag-detail.html için)
    const format = req.query.format;
    if (format === "json") {
      // Tag bilgilerini JSON olarak döndür
      // Kullanıcı bilgilerini de ekle (profil linkleri için)
      let userData = null;
      if (dahiosData.isActive) {
        const usersSnapshot = await db
            .collection("users")
            .where("devices", "array-contains", dahiosId)
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
          userData = usersSnapshot.docs[0].data();
        }
      }

      return res.status(200).json({
        status: "success",
        data: {
          dahiosId: dahiosId,
          ...dahiosData,
          user: userData,
        },
      });
    }

    // Tüm bilgileri URL parametreleri olarak gönder
    const profileLinkTypes = dahiosData.profileLinkTypes ||
      (dahiosData.profileLinkType ? [dahiosData.profileLinkType] : []);

    // Kullanıcı bilgilerini al (profil linkleri için)
    let userData = null;
    if (dahiosData.isActive && profileLinkTypes &&
        profileLinkTypes.length > 0) {
      const usersSnapshot = await db
          .collection("users")
          .where("devices", "array-contains", dahiosId)
          .limit(1)
          .get();

      if (!usersSnapshot.empty) {
        userData = usersSnapshot.docs[0].data();
      }
    }

    // Pasif tag, birden fazla profil linki veya sadece IBAN varsa
    // tag-detail.html'e yönlendir (IBAN için tek link de sayfada gösterilsin)
    const onlyIban = profileLinkTypes &&
        profileLinkTypes.length === 1 &&
        profileLinkTypes[0] === "iban";
    if (!dahiosData.isActive ||
        (profileLinkTypes && profileLinkTypes.length > 1) ||
        onlyIban) {
      const params = new URLSearchParams();
      params.append("dahiosId", dahiosId);
      params.append("isActive",
          dahiosData.isActive ? "true" : "false");
      params.append("characterId", dahiosData.characterId || "");

      if (profileLinkTypes && profileLinkTypes.length > 0) {
        params.append("profileLinkTypes",
            JSON.stringify(profileLinkTypes));
      }

      if (userData) {
        // Kullanıcı bilgilerini JSON olarak ekle
        const userInfo = {};
        profileLinkTypes.forEach((linkType) => {
          if (userData[linkType]) {
            userInfo[linkType] = userData[linkType];
          }
        });
        // IBAN paylaşımında banka ve ad soyad da gönderilsin
        if (profileLinkTypes.includes("iban")) {
          if (userData.paymentAccountName) {
            userInfo.paymentAccountName = userData.paymentAccountName;
          }
          if (userData.bankName) {
            userInfo.bankName = userData.bankName;
          }
        }
        if (Object.keys(userInfo).length > 0) {
          params.append("userData", JSON.stringify(userInfo));
        }
      }

      const redirectUrl =
          `https://dahis.io/tag-detail.html?${params.toString()}`;
      return res.redirect(302, redirectUrl);
    }

    // Tek profil linki varsa direkt yönlendir (IBAN hariç; IBAN yukarıda tag-detail'a gitti)
    if (profileLinkTypes &&
        profileLinkTypes.length === 1 &&
        profileLinkTypes[0] !== "iban" &&
        userData) {
      const profileLinkType = profileLinkTypes[0];
      const profileValue = userData[profileLinkType] || "";

      if (profileValue) {
        let redirectUrl;
        switch (profileLinkType) {
          case "instagram": {
            const instagramHandle = profileValue.replace(/^@?/, "");
            redirectUrl = `https://www.instagram.com/${instagramHandle}/`;
            break;
          }
          case "whatsapp": {
            const whatsappNumber = profileValue.replace(/\D/g, "");
            redirectUrl = `https://wa.me/${whatsappNumber}`;
            break;
          }
          case "phone": {
            const phoneNumber = profileValue.replace(/\D/g, "");
            redirectUrl = `tel:${phoneNumber}`;
            break;
          }
          case "email":
            redirectUrl = `mailto:${profileValue}`;
            break;
          default:
            redirectUrl =
                `https://www.dahis.io/character/${dahiosData.characterId || ""}`;
        }
        return res.redirect(302, redirectUrl);
      }
    }

    // Diğer durumlar için yönlendirme URL'ini oluştur
    let redirectUrl;
    const redirectType = dahiosData.redirectType || "character";
    const characterId = dahiosData.characterId;
    const customUrl = dahiosData.customUrl || "";

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
      case "instagram": {
        const instagramHandle = customUrl.replace(/^@?/, "");
        redirectUrl = `https://www.instagram.com/${instagramHandle}/`;
        break;
      }
      case "whatsapp": {
        const whatsappNumber = customUrl.replace(/\D/g, "");
        redirectUrl = `https://wa.me/${whatsappNumber}`;
        break;
      }
      case "phone": {
        const phoneNumber = customUrl.replace(/\D/g, "");
        redirectUrl = `tel:${phoneNumber}`;
        break;
      }
      case "email":
        redirectUrl = `mailto:${customUrl}`;
        break;
      default:
        redirectUrl = customUrl || `https://www.dahis.io/character/${characterId}`;
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
        profileLinkType: dahiosData.profileLinkType || null,
        profileLinkTypes: dahiosData.profileLinkTypes || null,
        warrantyStartDate:
            dahiosData.warrantyStartDate ?
                dahiosData.warrantyStartDate.toDate().toISOString() :
                null,
        warrantyEndDate:
            dahiosData.warrantyEndDate ?
                dahiosData.warrantyEndDate.toDate().toISOString() :
                null,
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
        warrantyStartDate:
            tagData.warrantyStartDate ?
                tagData.warrantyStartDate.toDate().toISOString() :
                null,
        warrantyEndDate:
            tagData.warrantyEndDate ?
                tagData.warrantyEndDate.toDate().toISOString() :
                null,
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
          "redirectType must be one of: character, store, campaign, " +
          "instagram, whatsapp, phone, email",
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

    // Garanti süresi: 2 yıl (730 gün)
    const now = admin.firestore.Timestamp.now();
    const warrantyStartDate = now;
    const warrantyEndDate = new admin.firestore.Timestamp(
        now.seconds + (2 * 365 * 24 * 60 * 60), // 2 yıl = 730 gün
        now.nanoseconds,
    );

    // dahiOS tag verisi
    const dahiosData = {
      dahiosId: dahiosId,
      characterId: characterId,
      redirectType: redirectType,
      isActive: isActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      warrantyStartDate: warrantyStartDate,
      warrantyEndDate: warrantyEndDate,
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
        warrantyStartDate: warrantyStartDate.toDate().toISOString(),
        warrantyEndDate: warrantyEndDate.toDate().toISOString(),
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
            "redirectType must be one of: character, store, campaign, " +
            "instagram, whatsapp, phone, email",
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

    // profileLinkTypes array desteği
    if (req.body.profileLinkTypes !== undefined) {
      if (req.body.profileLinkTypes === null ||
          (Array.isArray(req.body.profileLinkTypes) &&
           req.body.profileLinkTypes.length === 0)) {
        // profileLinkTypes'i kaldır
        updateData.profileLinkTypes = admin.firestore.FieldValue.delete();
        // Backward compatibility: profileLinkType'i de kaldır
        updateData.profileLinkType = admin.firestore.FieldValue.delete();
      } else if (Array.isArray(req.body.profileLinkTypes)) {
        updateData.profileLinkTypes = req.body.profileLinkTypes;
        // Backward compatibility: İlk link'i profileLinkType olarak da kaydet
        if (req.body.profileLinkTypes.length > 0) {
          updateData.profileLinkType = req.body.profileLinkTypes[0];
        }
      }
    }

    // Backward compatibility: profileLinkType tek başına gönderilirse
    if (req.body.profileLinkType !== undefined &&
       req.body.profileLinkTypes === undefined) {
      if (req.body.profileLinkType === null ||
         req.body.profileLinkType === "") {
        // profileLinkType'i kaldır
        updateData.profileLinkType = admin.firestore.FieldValue.delete();
        updateData.profileLinkTypes = admin.firestore.FieldValue.delete();
      } else {
        updateData.profileLinkType = req.body.profileLinkType;
        updateData.profileLinkTypes = [req.body.profileLinkType];
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
        profileLinkType: updatedData.profileLinkType || null,
        profileLinkTypes: updatedData.profileLinkTypes || null,
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

/**
 * Push Notification Gönderme
 * POST /sendPushNotification
 * Body: { title, body, userIds?, allUsers?, data?, useTopic? }
 */
exports.sendPushNotification = onRequest({cors: true}, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        status: "error",
        message: "Method not allowed",
      });
    }

    const {title, body, userIds, allUsers, data, useTopic} = req.body;

    if (!title || !body) {
      return res.status(400).json({
        status: "error",
        message: "title and body are required",
      });
    }

    // Topic kullanarak gönder (tüm kullanıcılara)
    if (useTopic === true && allUsers === true) {
      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: data || {},
        android: {
          priority: "high",
        },
        apns: {
          payload: {
            aps: {
              "alert": {"title": title, "body": body},
              "sound": "default",
              "badge": 1,
              "content-available": 1,
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
        topic: "all_users",
      };

      try {
        const response = await messaging.send(message);
        logger.info("FCM topic send success:", response);
        return res.status(200).json({
          status: "success",
          message: "Push notification sent via topic",
          results: {
            totalTokens: "topic:all_users",
            success: 1,
            failed: 0,
            errors: [],
            messageId: response,
          },
        });
      } catch (error) {
        logger.error("FCM topic send error:", error);
        return res.status(500).json({
          status: "error",
          message: error.message || "Failed to send via topic",
          error: error.toString(),
        });
      }
    }

    // Token bazlı gönderim
    const fcmTokens = [];

    if (allUsers === true) {
      // Tüm kullanıcılara gönder - token'ı olan herkese
      const usersSnapshot = await db.collection("users").get();
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const token = userData.fcmToken;
        if (token && typeof token === "string" && token.trim().length > 0) {
          fcmTokens.push(token);
        }
      });
    } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // Belirli kullanıcılara gönder - token'ı olanlara
      for (const userId of userIds) {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const token = userData.fcmToken;
          if (token && typeof token === "string" && token.trim().length > 0) {
            fcmTokens.push(token);
          }
        }
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "Either allUsers or userIds array is required",
      });
    }

    // Token yoksa boş sonuç döndür
    if (fcmTokens.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Push notification gönderildi",
        results: {
          totalTokens: 0,
          success: 0,
          failed: 0,
          errors: [],
        },
      });
    }

    // FCM mesajı oluştur
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    // Toplu gönderim (500 token'a kadar)
    const batchSize = 500;
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < fcmTokens.length; i += batchSize) {
      const batch = fcmTokens.slice(i, i + batchSize);
      try {
        const response = await messaging.sendEachForMulticast({
          ...message,
          tokens: batch,
        });
        results.success += response.successCount;
        results.failed += response.failureCount;
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              results.errors.push({
                token: batch[idx].substring(0, 20) + "...",
                error: resp.error.message || resp.error.code || "Unknown error",
              });
            }
          });
        }
      } catch (error) {
        logger.error("FCM send error:", error);
        results.failed += batch.length;
        const errorMessage = error.message || error.code || "Unknown error";
        results.errors.push({
          batch: `Batch ${Math.floor(i / batchSize) + 1}`,
          error: errorMessage,
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Push notifications sent",
      results: {
        totalTokens: fcmTokens.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors.slice(0, 10), // İlk 10 hatayı göster
      },
    });
  } catch (error) {
    logger.error("Push notification error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
