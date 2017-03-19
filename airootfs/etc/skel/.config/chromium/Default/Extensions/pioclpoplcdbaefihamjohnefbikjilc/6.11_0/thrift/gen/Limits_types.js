/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */
EDAM_ATTRIBUTE_LEN_MIN=1,EDAM_ATTRIBUTE_LEN_MAX=4096,EDAM_ATTRIBUTE_REGEX="^[^p{Cc}p{Zl}p{Zp}]{1,4096}$",EDAM_ATTRIBUTE_LIST_MAX=100,EDAM_ATTRIBUTE_MAP_MAX=100,EDAM_GUID_LEN_MIN=36,EDAM_GUID_LEN_MAX=36,EDAM_GUID_REGEX="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",EDAM_EMAIL_LEN_MIN=6,EDAM_EMAIL_LEN_MAX=255,EDAM_EMAIL_LOCAL_REGEX="^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$",EDAM_EMAIL_DOMAIN_REGEX="^[A-Za-z0-9-]+(.[A-Za-z0-9-]+)*.([A-Za-z]{2,})$",EDAM_EMAIL_REGEX="^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9-]+)*.([A-Za-z]{2,})$",EDAM_VAT_REGEX="^((AT)?U[0-9]{8}|(BE)?0?[0-9]{9}|(BG)?[0-9]{9,10}|(CY)?[0-9]{8}L|(CZ)?[0-9]{8,10}|(DE)?[0-9]{9}|(DK)?[0-9]{8}|(EE)?[0-9]{9}|(EL|GR)?[0-9]{9}|(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]|(FI)?[0-9]{8}|(FR)?[0-9A-Z]{2}[0-9]{9}|(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|(HU)?[0-9]{8}|(IE)?[0-9]S[0-9]{5}L|(IT)?[0-9]{11}|(LT)?([0-9]{9}|[0-9]{12})|(LU)?[0-9]{8}|(LV)?[0-9]{11}|(MT)?[0-9]{8}|(NL)?[0-9]{9}B[0-9]{2}|(PL)?[0-9]{10}|(PT)?[0-9]{9}|(RO)?[0-9]{2,10}|(SE)?[0-9]{12}|(SI)?[0-9]{8}|(SK)?[0-9]{10})|[0-9]{9}MVA|[0-9]{6}|CHE[0-9]{9}(TVA|MWST|IVA)$",EDAM_TIMEZONE_LEN_MIN=1,EDAM_TIMEZONE_LEN_MAX=32,EDAM_TIMEZONE_REGEX="^([A-Za-z_-]+(/[A-Za-z_-]+)*)|(GMT(-|+)[0-9]{1,2}(:[0-9]{2})?)$",EDAM_MIME_LEN_MIN=3,EDAM_MIME_LEN_MAX=255,EDAM_MIME_REGEX="^[A-Za-z]+/[A-Za-z0-9._+-]+$",EDAM_MIME_TYPE_GIF="image/gif",EDAM_MIME_TYPE_JPEG="image/jpeg",EDAM_MIME_TYPE_PNG="image/png",EDAM_MIME_TYPE_WAV="audio/wav",EDAM_MIME_TYPE_MP3="audio/mpeg",EDAM_MIME_TYPE_AMR="audio/amr",EDAM_MIME_TYPE_AAC="audio/aac",EDAM_MIME_TYPE_M4A="audio/mp4",EDAM_MIME_TYPE_MP4_VIDEO="video/mp4",EDAM_MIME_TYPE_INK="application/vnd.evernote.ink",EDAM_MIME_TYPE_PDF="application/pdf",EDAM_MIME_TYPE_DEFAULT="application/octet-stream",EDAM_MIME_TYPES=["image/gif","image/jpeg","image/png","audio/wav","audio/mpeg","audio/amr","application/vnd.evernote.ink","application/pdf","video/mp4","audio/aac","audio/mp4"],EDAM_INDEXABLE_RESOURCE_MIME_TYPES=["application/msword","application/mspowerpoint","application/excel","application/vnd.ms-word","application/vnd.ms-powerpoint","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.presentationml.presentation","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.apple.pages","application/vnd.apple.numbers","application/vnd.apple.keynote","application/x-iwork-pages-sffpages","application/x-iwork-numbers-sffnumbers","application/x-iwork-keynote-sffkey"],EDAM_COMMERCE_SERVICE_EVERNOTE="Evernote",EDAM_COMMERCE_SERVICE_GOOGLE="Google",EDAM_COMMERCE_SERVICE_PAYPAL="Paypal",EDAM_COMMERCE_SERVICE_GIFT="Gift",EDAM_COMMERCE_SERVICE_TRIALPAY="TrialPay",EDAM_COMMERCE_SERVICE_TRIAL="Trial",EDAM_COMMERCE_SERVICE_GROUP="Group",EDAM_COMMERCE_SERVICE_BUNDLE="Bundle",EDAM_COMMERCE_SERVICE_POINTS="Points",EDAM_COMMERCE_SERVICE_CYBERSOURCE="CYBERSRC",EDAM_COMMERCE_SERVICE_ANDROID="ANDROID",EDAM_COMMERCE_SERVICE_AMAZON="AMAZON",EDAM_COMMERCE_SERVICE_IPHONE="ITUNES",EDAM_COMMERCE_SERVICE_IPHONE_SKITCH="ITUNES_S",EDAM_COMMERCE_SERVICE_MAC="ITUNES_X",EDAM_COMMERCE_SERVICE_BLACKBERRY="BB_WORLD",EDAM_COMMERCE_SERVICE_BUSINESS="BUSINESS",EDAM_COMMERCE_SERVICE_ADYEN_ALIPAY="ALIPAY",EDAM_COMMERCE_SERVICE_ADYEN_CREDITCARD="ADYEN_CC",EDAM_COMMERCE_SERVICE_ADYEN_PAYPAL="ADYEN_PP",EDAM_COMMERCE_SERVICE_CASH_ON_DELIVERY="COD",EDAM_COMMERCE_SERVICE_REPLACEMENT="REPL",EDAM_COMMERCE_SERVICE_FRIEND_REFERRAL="FRND_REF",EDAM_COMMERCE_DEFAULT_CURRENCY_COUNTRY_CODE="USD",EDAM_SEARCH_QUERY_LEN_MIN=0,EDAM_SEARCH_QUERY_LEN_MAX=1024,EDAM_SEARCH_QUERY_REGEX="^[^p{Cc}p{Zl}p{Zp}]{0,1024}$",EDAM_HASH_LEN=16,EDAM_USER_USERNAME_LEN_MIN=1,EDAM_USER_USERNAME_LEN_MAX=64,EDAM_USER_USERNAME_REGEX="^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$",EDAM_USER_NAME_LEN_MIN=1,EDAM_USER_NAME_LEN_MAX=255,EDAM_USER_NAME_REGEX="^[^p{Cc}p{Zl}p{Zp}]{1,255}$",EDAM_TAG_NAME_LEN_MIN=1,EDAM_TAG_NAME_LEN_MAX=100,EDAM_TAG_NAME_REGEX="^[^,p{Cc}p{Z}]([^,p{Cc}p{Zl}p{Zp}]{0,98}[^,p{Cc}p{Z}])?$",EDAM_NOTE_TITLE_LEN_MIN=1,EDAM_NOTE_TITLE_LEN_MAX=255,EDAM_NOTE_TITLE_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,253}[^p{Cc}p{Z}])?$",EDAM_NOTE_CONTENT_LEN_MIN=0,EDAM_NOTE_CONTENT_LEN_MAX=5242880,EDAM_APPLICATIONDATA_NAME_LEN_MIN=3,EDAM_APPLICATIONDATA_NAME_LEN_MAX=32,EDAM_APPLICATIONDATA_VALUE_LEN_MIN=0,EDAM_APPLICATIONDATA_VALUE_LEN_MAX=4092,EDAM_APPLICATIONDATA_ENTRY_LEN_MAX=4095,EDAM_APPLICATIONDATA_NAME_REGEX="^[A-Za-z0-9_.-]{3,32}$",EDAM_APPLICATIONDATA_VALUE_REGEX="^[^p{Cc}]{0,4092}$",EDAM_NOTEBOOK_NAME_LEN_MIN=1,EDAM_NOTEBOOK_NAME_LEN_MAX=100,EDAM_NOTEBOOK_NAME_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,98}[^p{Cc}p{Z}])?$",EDAM_NOTEBOOK_STACK_LEN_MIN=1,EDAM_NOTEBOOK_STACK_LEN_MAX=100,EDAM_NOTEBOOK_STACK_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,98}[^p{Cc}p{Z}])?$",EDAM_PUBLISHING_URI_LEN_MIN=1,EDAM_PUBLISHING_URI_LEN_MAX=255,EDAM_PUBLISHING_URI_REGEX="^[a-zA-Z0-9.~_+-]{1,255}$",EDAM_PUBLISHING_URI_PROHIBITED=[".."],EDAM_PUBLISHING_DESCRIPTION_LEN_MIN=1,EDAM_PUBLISHING_DESCRIPTION_LEN_MAX=200,EDAM_PUBLISHING_DESCRIPTION_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,198}[^p{Cc}p{Z}])?$",EDAM_SAVED_SEARCH_NAME_LEN_MIN=1,EDAM_SAVED_SEARCH_NAME_LEN_MAX=100,EDAM_SAVED_SEARCH_NAME_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,98}[^p{Cc}p{Z}])?$",EDAM_USER_PASSWORD_LEN_MIN=6,EDAM_USER_PASSWORD_LEN_MAX=64,EDAM_USER_PASSWORD_REGEX="^[A-Za-z0-9!#$%&'()*+,./:;<=>?@^_`{|}~[]\\-]{6,64}$",EDAM_BUSINESS_URI_LEN_MAX=32,EDAM_NOTE_TAGS_MAX=100,EDAM_NOTE_RESOURCES_MAX=1e3,EDAM_USER_TAGS_MAX=1e5,EDAM_BUSINESS_TAGS_MAX=1e5,EDAM_USER_SAVED_SEARCHES_MAX=100,EDAM_USER_NOTES_MAX=1e5,EDAM_BUSINESS_NOTES_MAX=5e5,EDAM_USER_NOTEBOOKS_MAX=250,EDAM_BUSINESS_NOTEBOOKS_MAX=5e3,EDAM_USER_RECENT_MAILED_ADDRESSES_MAX=10,EDAM_USER_MAIL_LIMIT_DAILY_FREE=50,EDAM_USER_MAIL_LIMIT_DAILY_PREMIUM=200,EDAM_USER_UPLOAD_LIMIT_FREE=62914560,EDAM_USER_UPLOAD_LIMIT_PREMIUM=1073741824,EDAM_USER_UPLOAD_LIMIT_BUSINESS=2147483647,EDAM_NOTE_SIZE_MAX_FREE=26214400,EDAM_NOTE_SIZE_MAX_PREMIUM=104857600,EDAM_RESOURCE_SIZE_MAX_FREE=26214400,EDAM_RESOURCE_SIZE_MAX_PREMIUM=104857600,EDAM_USER_LINKED_NOTEBOOK_MAX=100,EDAM_USER_LINKED_NOTEBOOK_MAX_PREMIUM=250,EDAM_NOTEBOOK_SHARED_NOTEBOOK_MAX=250,EDAM_NOTE_CONTENT_CLASS_LEN_MIN=3,EDAM_NOTE_CONTENT_CLASS_LEN_MAX=32,EDAM_NOTE_CONTENT_CLASS_REGEX="^[A-Za-z0-9_.-]{3,32}$",EDAM_HELLO_APP_CONTENT_CLASS_PREFIX="evernote.hello.",EDAM_FOOD_APP_CONTENT_CLASS_PREFIX="evernote.food.",EDAM_CONTENT_CLASS_HELLO_ENCOUNTER="evernote.hello.encounter",EDAM_CONTENT_CLASS_HELLO_PROFILE="evernote.hello.profile",EDAM_CONTENT_CLASS_FOOD_MEAL="evernote.food.meal",EDAM_CONTENT_CLASS_SKITCH_PREFIX="evernote.skitch",EDAM_CONTENT_CLASS_SKITCH="evernote.skitch",EDAM_CONTENT_CLASS_SKITCH_PDF="evernote.skitch.pdf",EDAM_CONTENT_CLASS_PENULTIMATE_PREFIX="evernote.penultimate.",EDAM_CONTENT_CLASS_PENULTIMATE_NOTEBOOK="evernote.penultimate.notebook",EDAM_SOURCE_APPLICATION_POSTIT="postit",EDAM_SOURCE_APPLICATION_MOLESKINE="moleskine",EDAM_SOURCE_APPLICATION_EN_SCANSNAP="scanner.scansnap.evernote",EDAM_RELATED_PLAINTEXT_LEN_MIN=1,EDAM_RELATED_PLAINTEXT_LEN_MAX=131072,EDAM_RELATED_MAX_NOTES=25,EDAM_RELATED_MAX_NOTEBOOKS=1,EDAM_RELATED_MAX_TAGS=25,EDAM_RELATED_MAX_EXPERTS=10,EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_LEN_MIN=1,EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_LEN_MAX=200,EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_REGEX="^[^p{Cc}p{Z}]([^p{Cc}p{Zl}p{Zp}]{0,198}[^p{Cc}p{Z}])?$",EDAM_BUSINESS_PHONE_NUMBER_LEN_MAX=20,EDAM_PREFERENCE_NAME_LEN_MIN=3,EDAM_PREFERENCE_NAME_LEN_MAX=32,EDAM_PREFERENCE_VALUE_LEN_MIN=1,EDAM_PREFERENCE_VALUE_LEN_MAX=1024,EDAM_MAX_PREFERENCES=100,EDAM_MAX_VALUES_PER_PREFERENCE=256,EDAM_PREFERENCE_ONLY_ONE_VALUE_LEN_MAX=16384,EDAM_PREFERENCE_NAME_REGEX="^[A-Za-z0-9_.-]{3,32}$",EDAM_PREFERENCE_VALUE_REGEX="^[^p{Cc}]{1,1024}$",EDAM_PREFERENCE_ONLY_ONE_VALUE_REGEX="^[^p{Cc}]{1,16384}$",EDAM_PREFERENCE_SHORTCUTS="evernote.shortcuts",EDAM_PREFERENCE_BUSINESS_DEFAULT_NOTEBOOK="evernote.business.notebook",EDAM_PREFERENCE_BUSINESS_QUICKNOTE="evernote.business.quicknote",EDAM_PREFERENCE_SHORTCUTS_MAX_VALUES=250,EDAM_DEVICE_ID_LEN_MAX=32,EDAM_DEVICE_ID_REGEX="^[^p{Cc}]{1,32}$",EDAM_DEVICE_DESCRIPTION_LEN_MAX=64,EDAM_DEVICE_DESCRIPTION_REGEX="^[^p{Cc}]{1,64}$",EDAM_SEARCH_SUGGESTIONS_MAX=10,EDAM_SEARCH_SUGGESTIONS_PREFIX_LEN_MAX=1024,EDAM_SEARCH_SUGGESTIONS_PREFIX_LEN_MIN=2,EDAM_FIND_CONTACT_DEFAULT_MAX_RESULTS=100,EDAM_FIND_CONTACT_MAX_RESULTS=256;