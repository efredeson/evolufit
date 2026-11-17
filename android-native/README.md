# EvoluFit Android Nativo — APK de testes

Versão **Android Java + Views**. Esta é uma implementação nativa, **sem navegador, PWA ou WebView**. O código não é um espelho do site; é um primeiro protótipo Android para avaliar o aplicativo diretamente no celular.

## Principais recursos nesta versão

- Preto AMOLED, verde neon, marca do gatinho, navegação nativa.
- Central de Missões e exercícios guiados em casa com **imagens originais aprovadas**, cronômetro e registro de conclusão.
- Registro de caminhadas, refeições, água e peso; gráfico nativo de peso.
- Fotos de progresso guardadas no armazenamento interno privado do aplicativo.
- Lembretes **nativos** de refeição via `AlarmManager.setInexactRepeating`; pode haver atraso conforme as políticas de bateria do Android. O agendamento pode precisar ser refeito após reiniciar o aparelho.
- Dados em `SharedPreferences` privadas, sem enviar ao site ou ao Supabase.

## O que ainda não faz

- **Não tem login/sincronização Supabase** nesta versão nativa: os registros do site NÃO aparecem automaticamente aqui.
- Não tem GPS, integração com relógios ou alarmes exatos.
- Os exercícios são demonstrativos, não prescrições médicas individualizadas.
- Não é versão de Play Store. Debug APK, assinado apenas pela chave de desenvolvimento do build.

## Gerar APK

Na raiz deste projeto, com Android SDK instalado, Java 17 e Gradle 8.9:

```bash
gradle :app:assembleDebug
```

O arquivo gerado é `app/build/outputs/apk/debug/app-debug.apk`.

No repositório do EvoluFit, o workflow GitHub Actions `.github/workflows/evolufit-android-native.yml` faz essa compilação automaticamente. Vá em **Actions → EvoluFit Android Nativo - APK teste → execução concluída → Artifacts** e baixe o arquivo `EvoluFit-Android-Nativo-debug-APK`. Extraia o `.apk` e instale no celular.

> Não desative o Play Protect. Para instalar um APK de teste criado por você, o Android pode pedir autorização para instalar a partir do aplicativo de onde veio o arquivo. Essa autorização pode ser revogada depois.

## Segurança/privacidade

O aplicativo pede apenas a permissão `POST_NOTIFICATIONS` quando você ativa os lembretes em Android 13+. Não solicita acesso irrestrito à galeria, localização ou arquivos. Fotos são escolhidas pelo seletor de documentos do sistema e copiadas para área interna do próprio aplicativo.

## Fontes das imagens

Os scripts do workflow obtêm as imagens da pasta pública `assets` do repositório EvoluFit, mas **essas imagens ficam dentro do APK após a compilação** e não são carregadas da internet quando você abre o app.

## Identidade

`applicationId`: `br.com.evolufit.nativeapp` · `minSdk`: 26 · `targetSdk`: 35. O APK pode ser instalado junto com o navegador/site e não modifica os dados locais do site.