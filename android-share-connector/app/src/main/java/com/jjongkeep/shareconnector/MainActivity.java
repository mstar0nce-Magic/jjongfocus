package com.jjongkeep.shareconnector;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String TARGET = "https://jjongfocus.pages.dev/";

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        forward(getIntent());
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        forward(intent);
    }

    private void forward(Intent intent) {
        if (!Intent.ACTION_SEND.equals(intent.getAction()) || intent.getType() == null || !intent.getType().startsWith("text/")) {
            Toast.makeText(this, "텍스트나 링크를 공유해 주세요.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        CharSequence text = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
        CharSequence subject = intent.getCharSequenceExtra(Intent.EXTRA_SUBJECT);
        StringBuilder value = new StringBuilder();
        if (subject != null && subject.length() > 0) value.append(subject.toString().trim());
        if (text != null && text.length() > 0) {
            if (value.length() > 0 && !value.toString().equals(text.toString().trim())) value.append("\n\n");
            value.append(text.toString().trim());
        }
        if (value.length() == 0) {
            Toast.makeText(this, "공유된 텍스트를 찾지 못했어요.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        Uri uri = Uri.parse(TARGET).buildUpon().appendQueryParameter("nativeShare", value.toString()).build();
        Intent open = new Intent(Intent.ACTION_VIEW, uri);
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(open);
        finish();
    }
}
