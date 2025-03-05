package com.java.NBE4_5_1_7.global.exception;

import com.java.NBE4_5_1_7.global.dto.RsData;

public class ServiceException extends RuntimeException {

    private RsData<?> rsData;

    public ServiceException(String code, String message) {
        super(message);
        rsData = new RsData<>(code, message);
    }

    public String getCode() {
        return rsData.getCode();
    }

    public String getMsg() {
        return rsData.getMsg();
    }

    public int getStatusCode() {
        return rsData.getStatusCode();
    }

}
