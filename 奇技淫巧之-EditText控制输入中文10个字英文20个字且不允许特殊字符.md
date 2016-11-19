---
title: 奇技淫巧之-EditText控制输入中文10个字英文20个字且不允许特殊字符
grammar_cjkRuby: true
---

### 备注
这个需求是大家经常用到的，比如在控制用户名输入时经常要用到。

此方法是设置文本监听器，省事，好用，且ROM，平台无关。
### code

``` java
    private static final String SPECIAL_CHARACTERS =  "[\"\"''`~!@#$%^&*()+=|{}':;',\\[\\].<>/?~！
    @#￥%……&*（）—-—+|{}【】‘；：”“’。，、？]";
    private static final Pattern NAME_PATTERN;
    static {
        NAME_PATTERN = Pattern.compile(SPECIAL_CHARACTERS);
    }
 
 
    private TextWatcher textWatcher = new TextWatcher() {
        private int editStart;
        private int editEnd;
        private int maxLen = 20;
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
        }

        @Override
        public void afterTextChanged(Editable s) {
            editStart = mEditText.getSelectionStart();
            editEnd = mEditText.getSelectionEnd();
            mEditText.removeTextChangedListener(textWatcher);
            if (!TextUtils.isEmpty(mEditText.getText())) {
                String etstring = mEditText.getText().toString().trim();
                while (calculateLength(s.toString()) > maxLen) {
                    s.delete(editStart - 1, editEnd);
                    editStart--;
                    editEnd--;
                }
            }
            mEditText.setText(s);
            mEditText.setSelection(editStart);
            Matcher m = NAME_PATTERN.matcher(s);
            if( m.find()){
                ToastUtils.showToast(mContext, R.string.robot_name_error);
                editStart = mEditText.getSelectionStart();
                s.delete( mEditText.getSelectionEnd() - 1, mEditText.getSelectionEnd());
                mEditText.setText(s);
                mEditText.setSelection(editStart - 1);
            }
            mEditText.addTextChangedListener(textWatcher);
        }

        private int calculateLength(String etstring) {
            char[] ch = etstring.toCharArray();
            int varlength = 0;
            for (int i = 0; i < ch.length; i++) {
                if ((ch[i] >= 0x2E80 && ch[i] <= 0xFE4F) || (ch[i] >= 0xA13F 
                && ch[i] <= 0xAA40) || ch[i] >= 0x80) {
                    varlength = varlength + 2;
                } else {
                    varlength++;
                }
            }
            return varlength;
        }
    };
```
使用时，只需要

mEditText.addTextChangedListener(textWatcher);


 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
