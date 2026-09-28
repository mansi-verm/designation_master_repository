//package com.organization.master;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//@SpringBootApplication
//public class MasterServiceApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(MasterServiceApplication.class, args);
//		System.out.println("application running");
//	}
//
//}
package com.organization.master;

import com.organization.common.config.CommonRedisConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(CommonRedisConfig.class)
public class MasterServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MasterServiceApplication.class, args);
		System.out.println("application running");
	}

}