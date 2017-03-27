---
title: 2016-08-11-Android之Builder模式
tags:
  - Android
  - 设计模式
grammar_cjkRuby: true
catalog: true
layout:  post
---

![设计模式](/img/always/design_patterns.png)

### 简介

 我们首先来看一下Builder模式的**定义**：23种设计模式之一，英文叫Builder Pattern。其核心思想是将一个“复杂对象的构建算法”与它的“部件及组装方式”分离，使得构件算法和组装方式可以独立应对变化；复用同样的构建算法可以创建不同的表示，不同的构建过程可以复用相同的部件组装方式。

Builder模式目的将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

**我们应该在以下情况使用Build模式：**

1 当创建复杂对象的算法应该独立于该对象的组成部分以及它们的装配方式时。

2 当构造过程必须允许被构造的对象有不同的表示时。

3 Builder模式要解决的也正是这样的问题：

　　当我们要创建的对象很复杂的时候（通常是由很多其他的对象组合而成），

　　我们要复杂对象的创建过程和这个对象的表示（展示）分离开来，

　　这样做的好处就是通过一步步的进行复杂对象的构建，

　　由于在每一步的构造过程中可以引入参数，使得经过相同的步骤创建最后得到的对象的展示不一样。

没有Builder模式的时候，是怎么样写代码的？
举个组装电脑的例子来说明。有一台电脑类，如下

``` vbscript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;
}
```


如果要组装这样一台电脑，可以使用构造方法传入参数列表，构建一个对象

``` typescript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;

    public Computer(String cpu, String motherboard, String displayCard, String ram, String disk, String power) {
        this.cpu = cpu;
        this.motherboard = motherboard;
        this.displayCard = displayCard;
        this.ram = ram;
        this.disk = disk;
        this.power = power;
    }
}
```


但是参数列表的长度也太长了，看得都烦躁。而且，在使用构造 Computer 对象的时候，有可能暂时不需要传入某些参数，比如目前只需要一个 CPU，那么就要重新写一个构造方法，这样也挺麻烦的。

``` java
public Computer(String cpu) {
    this.cpu = cpu;
}
```


Builder模式解决的问题
要实现电脑配件的定制化，这个时候，就可以使用 Builder 模式。

在 Computer 类中写一个 Builder 类，配件的装备工作交由 Builder 来完成。

``` typescript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public void setMotherboard(String motherboard) {
        this.motherboard = motherboard;
    }

    public void setDisplayCard(String displayCard) {
        this.displayCard = displayCard;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public void setDisk(String disk) {
        this.disk = disk;
    }

    public void setPower(String power) {
        this.power = power;
    }

    public static class Builder {
        private String cpu;
        private String motherboard;
        private String displayCard;
        private String ram;
        private String disk;
        private String power;

        public Builder setCpu(String cpu) {
            this.cpu = cpu;
            return this;
        }

        public Builder setMotherboard(String motherboard) {
            this.motherboard = motherboard;
            return this;
        }

        public Builder setDisplayCard(String displayCard) {
            this.displayCard = displayCard;
            return this;
        }

        public Builder setRam(String ram) {
            this.ram = ram;
            return this;
        }

        public Builder setDisk(String disk) {
            this.disk = disk;
            return this;
        }

        public Builder setPower(String power) {
            this.power = power;
            return this;
        }

        public Computer create() {
            Computer computer = new Computer();

            if (cpu != null) {
                computer.setCpu(cpu);
            }
            if (motherboard != null) {
                computer.setMotherboard(motherboard);
            }
            if (displayCard != null) {
                computer.setDisplayCard(displayCard);
            }
            if (ram != null) {
                computer.setRam(ram);
            }
            if (disk != null) {
                computer.setDisk(disk);
            }
            if (power != null) {
                computer.setPower(power);
            }

            return computer;
        }
    }
}
```


组装电脑的代码如下

``` pf
Computer computer = new Computer.Builder()
    .setCpu("Intel Core i7")
    .setMotherboard("GIGABYTE Z97")
    .setDisplayCard("GTX Titan")
    .setRam("32G")
    .setDisk("2TB")
    .setPower("1000W")
    .create();
```


通过使用 Builder 模式，实现了对象的定制化构建，而且采用链式调用，方便了代码编写。我们应该在以下情况使用Build模式：

1 当创建复杂对象的算法应该独立于该对象的组成部分以及它们的装配方式时。

2 当构造过程必须允许被构造的对象有不同的表示时。

3 Builder模式要解决的也正是这样的问题：

　　当我们要创建的对象很复杂的时候（通常是由很多其他的对象组合而成），

　　我们要复杂对象的创建过程和这个对象的表示（展示）分离开来，

　　这样做的好处就是通过一步步的进行复杂对象的构建，

　　由于在每一步的构造过程中可以引入参数，使得经过相同的步骤创建最后得到的对象的展示不一样。

没有Builder模式的时候，是怎么样写代码的？
举个组装电脑的例子来说明。有一台电脑类，如下

``` vbscript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;
}
```


如果要组装这样一台电脑，可以使用构造方法传入参数列表，构建一个对象

``` typescript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;

    public Computer(String cpu, String motherboard, String displayCard, String ram, String disk, String power) {
        this.cpu = cpu;
        this.motherboard = motherboard;
        this.displayCard = displayCard;
        this.ram = ram;
        this.disk = disk;
        this.power = power;
    }
}
```


但是参数列表的长度也太长了，看得都烦躁。而且，在使用构造 Computer 对象的时候，有可能暂时不需要传入某些参数，比如目前只需要一个 CPU，那么就要重新写一个构造方法，这样也挺麻烦的。

``` java
public Computer(String cpu) {
    this.cpu = cpu;
}
```


Builder模式解决的问题

要实现电脑配件的定制化，这个时候，就可以使用 Builder 模式。

在 Computer 类中写一个 Builder 类，配件的装备工作交由 Builder 来完成。

``` typescript
public class Computer {
    private String cpu;
    private String motherboard;
    private String displayCard;
    private String ram;
    private String disk;
    private String power;

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public void setMotherboard(String motherboard) {
        this.motherboard = motherboard;
    }

    public void setDisplayCard(String displayCard) {
        this.displayCard = displayCard;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public void setDisk(String disk) {
        this.disk = disk;
    }

    public void setPower(String power) {
        this.power = power;
    }

    public static class Builder {
        private String cpu;
        private String motherboard;
        private String displayCard;
        private String ram;
        private String disk;
        private String power;

        public Builder setCpu(String cpu) {
            this.cpu = cpu;
            return this;
        }

        public Builder setMotherboard(String motherboard) {
            this.motherboard = motherboard;
            return this;
        }

        public Builder setDisplayCard(String displayCard) {
            this.displayCard = displayCard;
            return this;
        }

        public Builder setRam(String ram) {
            this.ram = ram;
            return this;
        }

        public Builder setDisk(String disk) {
            this.disk = disk;
            return this;
        }

        public Builder setPower(String power) {
            this.power = power;
            return this;
        }

        public Computer create() {
            Computer computer = new Computer();

            if (cpu != null) {
                computer.setCpu(cpu);
            }
            if (motherboard != null) {
                computer.setMotherboard(motherboard);
            }
            if (displayCard != null) {
                computer.setDisplayCard(displayCard);
            }
            if (ram != null) {
                computer.setRam(ram);
            }
            if (disk != null) {
                computer.setDisk(disk);
            }
            if (power != null) {
                computer.setPower(power);
            }

            return computer;
        }
    }
}
```


组装电脑的代码如下

``` pf
Computer computer = new Computer.Builder()
    .setCpu("Intel Core i7")
    .setMotherboard("GIGABYTE Z97")
    .setDisplayCard("GTX Titan")
    .setRam("32G")
    .setDisk("2TB")
    .setPower("1000W")
    .create();
```


通过使用 Builder 模式，实现了对象的定制化构建，而且采用链式调用，方便了代码编写。

 ----------

### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 CSDN地址   :  [Jerey_Jobs的专栏][3] <br>
 github地址 :  [Jerey_Jobs][4]



  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
