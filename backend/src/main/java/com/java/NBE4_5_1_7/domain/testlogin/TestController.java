package com.java.NBE4_5_1_7.domain.testlogin;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Controller
public class TestController {

  @GetMapping(value = "/", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public String home() {
        return "API 서버에 오신 걸 환영합니다.";
    }

    @GetMapping("/info")
    @ResponseBody
    public Map<String, Object> session(HttpSession session) {
        Map<String, Object> sessionMap = new HashMap<>();

        Enumeration<String> names = session.getAttributeNames();

        while(names.hasMoreElements()) {
            String name = names.nextElement();
            sessionMap.put(name, session.getAttribute(name));
        }

        return sessionMap;
    }
}
