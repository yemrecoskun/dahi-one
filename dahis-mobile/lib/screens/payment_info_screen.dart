import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../widgets/custom_toast.dart';

class PaymentInfoScreen extends StatefulWidget {
  const PaymentInfoScreen({super.key});

  @override
  State<PaymentInfoScreen> createState() => _PaymentInfoScreenState();
}

class _PaymentInfoScreenState extends State<PaymentInfoScreen> {
  final _authService = AuthService();
  bool _isLoading = true;
  bool _isSaving = false;

  final _ibanController = TextEditingController();
  final _bankNameController = TextEditingController();
  final _accountNameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPaymentData();
  }

  @override
  void dispose() {
    _ibanController.dispose();
    _bankNameController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  Future<void> _loadPaymentData() async {
    setState(() => _isLoading = true);
    try {
      final userData = await _authService.getUserData();
      if (userData != null && mounted) {
        _ibanController.text = (userData['iban'] as String?) ?? '';
        _bankNameController.text = (userData['bankName'] as String?) ?? '';
        _accountNameController.text = (userData['paymentAccountName'] as String?) ?? '';
      }
    } catch (e) {
      if (mounted) {
        CustomToast.showError(context, 'Ödeme bilgileri yüklenemedi.');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _savePaymentInfo() async {
    if (_isSaving) return;

    setState(() => _isSaving = true);
    try {
      await _authService.updatePaymentInfo(
        iban: _ibanController.text,
        bankName: _bankNameController.text,
        paymentAccountName: _accountNameController.text,
      );
      if (mounted) {
        CustomToast.showSuccess(context, 'Ödeme bilgileri kaydedildi.');
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Ödeme bilgileri kaydedilirken bir sorun oluştu.';
        final errorStr = e.toString().toLowerCase();
        if (errorStr.contains('network') ||
            errorStr.contains('connection') ||
            errorStr.contains('internet')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (errorStr.contains('permission') ||
            errorStr.contains('unauthorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
        }
        CustomToast.showError(context, errorMessage);
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ödeme Bilgilerim'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Havale / EFT ile ödemelerde kullanılacak bilgilerinizi girin.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildField(
                    controller: _accountNameController,
                    label: 'Ad Soyad',
                    hint: 'Hesap sahibi adı soyadı',
                    icon: Icons.person_outline,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  _buildField(
                    controller: _bankNameController,
                    label: 'Banka',
                    hint: 'Banka adı',
                    icon: Icons.account_balance_outlined,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  _buildField(
                    controller: _ibanController,
                    label: 'IBAN',
                    hint: 'TR00 0000 0000 0000 0000 0000 00',
                    icon: Icons.credit_card_outlined,
                    keyboardType: TextInputType.text,
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9\s]')),
                      LengthLimitingTextInputFormatter(34),
                      _IbanInputFormatter(),
                    ],
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _savePaymentInfo,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF667eea),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Kaydet',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.none,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF667eea).withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF667eea), size: 24),
              const SizedBox(width: 12),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFb0b0b8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white),
            keyboardType: keyboardType,
            textCapitalization: textCapitalization,
            inputFormatters: inputFormatters,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(color: Color(0xFF666666)),
              filled: true,
              fillColor: const Color(0xFF0a0a0f),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// IBAN'ı 4'lü gruplar halinde formatlar (TR 00 0000 0000 ...)
class _IbanInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text.replaceAll(' ', '').toUpperCase();
    if (text.length > 34) return oldValue;
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(text[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
